# Hitster playback + QR-scan spike Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a throwaway tech spike that logs into Spotify, imports a pasted playlist link, renders its tracks as QR cards, and plays a scanned card's full track in-browser with its identity hidden.

**Architecture:** `src/audio/` stays the pure `AudioProvider` interface + `MockProvider`. A new `src/spotify/` module holds all concrete Spotify integration (config, PKCE auth, Web API client, Web Playback SDK loader, and a `SpotifyProvider` that implements `AudioProvider`). A new `src/scan/` module holds a pure QR-token codec plus a camera scanner and a mock scanner. A bare `SpikeHarness.tsx` wires it together; a `?mock=1` flag swaps in mock provider + scanner so Playwright never touches real Spotify or a camera. `src/core/` is untouched.

**Tech Stack:** React 19 + Vite + TS, Tailwind v4, Vitest (+ jsdom), Playwright, `@zxing/browser` (camera QR decode), `qrcode` (render QR images), Spotify Web Playback SDK (runtime script) + Web API.

---

## Spec reference

`docs/superpowers/specs/2026-06-03-hitster-playback-scan-spike-design.md`. Tracked by GitHub issue #1.

## File structure

```
src/
  audio/                  (unchanged) AudioProvider interface + MockProvider
  spotify/
    types.ts              SpotifyTokens, SpotifyTrack, PlaylistImportResult
    config.ts             getSpotifyConfig(): read VITE_SPOTIFY_* or throw
    config.test.ts
    pkce.ts               generateVerifier, deriveChallenge, base64url (pure crypto)
    pkce.test.ts
    auth.ts               SCOPES, buildAuthorizeUrl, exchangeCodeForTokens, refreshTokens, isExpired, token + verifier storage
    auth.test.ts
    client.ts             parsePlaylistId, parseYear, mapTrack, fetchPlaylistTracks
    client.test.ts
    sdk.ts                loadSdk, createConnectedPlayer (injectable Spotify global)
    sdk.test.ts
    provider.ts           SpotifyProvider implements AudioProvider
    provider.test.ts
    index.ts
  scan/
    token.ts              encodeTrackToken, decodeTrackToken, trackIdToUri
    token.test.ts
    scanner.ts            QrScanner interface + CameraQrScanner (@zxing/browser)
    mock-scanner.ts       MockScanner
    mock-scanner.test.ts
    qr-image.ts           renderQrDataUrl (qrcode lib)
    index.ts
  ui/
    spike-deps.ts         createSpikeDeps(search): real vs mock provider+scanner
    SpikeHarness.tsx      the dev harness page
    App.tsx               (modify) route '/' and '/callback' to the harness
  vite-env.d.ts           (modify) type the VITE_SPOTIFY_* env vars
e2e/
  spike.spec.ts           Playwright: ?mock=1 scan -> "Now playing"
```

Each task is committed on the feature branch created at execution time (the `using-git-worktrees` skill). Commit messages reference issue #1.

---

## Task 1: Add dependencies

**Files:**

- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install runtime + dev deps**

Run:

```bash
npm install @zxing/browser qrcode
npm install -D @types/spotify-web-playback-sdk @types/qrcode
```

- [ ] **Step 2: Verify install and typecheck still passes**

Run: `npm run build`
Expected: typecheck + build succeed (no usage yet, just deps present).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add zxing, qrcode, and Spotify SDK type deps (#1)"
```

---

## Task 2: QR token codec (pure)

**Files:**

- Create: `src/scan/token.ts`
- Test: `src/scan/token.test.ts`

The codec encodes an opaque app token (`chrono:t:<id>`), never a URL, so a phone's native camera cannot act on it. `trackIdToUri` returns the existing `AudioTrackRef` shape from `src/audio/types.ts`.

- [ ] **Step 1: Write the failing test**

```ts
// src/scan/token.test.ts
import { describe, expect, it } from 'vitest'
import { encodeTrackToken, decodeTrackToken, trackIdToUri } from './token'

const ID = '3n3Ppam7vgaVa1iaRUc9Lp'

describe('track token codec', () => {
  it('encodes a track id to a chrono token', () => {
    expect(encodeTrackToken(ID)).toBe(`chrono:t:${ID}`)
  })

  it('round-trips encode -> decode', () => {
    expect(decodeTrackToken(encodeTrackToken(ID))).toBe(ID)
  })

  it('returns null for non-chrono text', () => {
    expect(decodeTrackToken('https://open.spotify.com/track/' + ID)).toBeNull()
    expect(decodeTrackToken('chrono:t:')).toBeNull()
    expect(decodeTrackToken('chrono:t:has space')).toBeNull()
    expect(decodeTrackToken('')).toBeNull()
  })

  it('maps a track id to a spotify uri AudioTrackRef', () => {
    expect(trackIdToUri(ID)).toEqual({ uri: `spotify:track:${ID}` })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/scan/token.test.ts`
Expected: FAIL ("Cannot find module './token'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/scan/token.ts
import type { AudioTrackRef } from '@/audio'

/** Prefix marking a QR as one of ours. Opaque token, deliberately not a URL. */
const PREFIX = 'chrono:t:'

/** Spotify ids are base62. Validate so junk QRs are rejected. */
const ID_RE = /^[A-Za-z0-9]+$/

export function encodeTrackToken(trackId: string): string {
  return `${PREFIX}${trackId}`
}

export function decodeTrackToken(text: string): string | null {
  if (!text.startsWith(PREFIX)) return null
  const id = text.slice(PREFIX.length)
  return ID_RE.test(id) ? id : null
}

export function trackIdToUri(trackId: string): AudioTrackRef {
  return { uri: `spotify:track:${trackId}` }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/scan/token.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scan/token.ts src/scan/token.test.ts
git commit -m "feat(scan): pure QR track-token codec (#1)"
```

---

## Task 3: Spotify domain types

**Files:**

- Create: `src/spotify/types.ts`

No test (types only). These are referenced by every later Spotify task; defining them here keeps signatures consistent.

- [ ] **Step 1: Create the types**

```ts
// src/spotify/types.ts

/** OAuth tokens. `expiresAt` is an epoch-ms timestamp. */
export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/** A track imported from a playlist. `year` is null when unparseable. */
export interface SpotifyTrack {
  id: string
  uri: string
  title: string
  artist: string
  year: number | null
}

export interface PlaylistImportResult {
  id: string
  tracks: SpotifyTrack[]
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/spotify/types.ts
git commit -m "feat(spotify): domain types for tokens, tracks, import (#1)"
```

---

## Task 4: Env config

**Files:**

- Create: `src/spotify/config.ts`
- Test: `src/spotify/config.test.ts`
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Type the env vars**

Append to `src/vite-env.d.ts` (create the interface if the file only has the `/// <reference>`):

```ts
interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID?: string
  readonly VITE_SPOTIFY_REDIRECT_URI?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/spotify/config.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSpotifyConfig } from './config'

afterEach(() => vi.unstubAllEnvs())

describe('getSpotifyConfig', () => {
  it('returns clientId and redirectUri from env', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'abc123')
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5173/callback')
    expect(getSpotifyConfig()).toEqual({
      clientId: 'abc123',
      redirectUri: 'http://127.0.0.1:5173/callback',
    })
  })

  it('throws a helpful error when clientId is missing', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '')
    expect(() => getSpotifyConfig()).toThrow(/VITE_SPOTIFY_CLIENT_ID/)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- src/spotify/config.test.ts`
Expected: FAIL ("Cannot find module './config'").

- [ ] **Step 4: Write minimal implementation**

```ts
// src/spotify/config.ts

export interface SpotifyConfig {
  clientId: string
  redirectUri: string
}

const DEFAULT_REDIRECT = 'http://127.0.0.1:5173/callback'

export function getSpotifyConfig(): SpotifyConfig {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Missing VITE_SPOTIFY_CLIENT_ID. Copy .env.example to .env and add your ' +
        'Spotify app client id.',
    )
  }
  return {
    clientId,
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT,
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- src/spotify/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/spotify/config.ts src/spotify/config.test.ts src/vite-env.d.ts
git commit -m "feat(spotify): env config reader with helpful error (#1)"
```

---

## Task 5: PKCE primitives

**Files:**

- Create: `src/spotify/pkce.ts`
- Test: `src/spotify/pkce.test.ts`

`deriveChallenge` is tested against the RFC 7636 Appendix B test vector, so the SHA-256 + base64url is provably correct. Uses Web Crypto (`crypto.subtle`), available in jsdom via Node.

- [ ] **Step 1: Write the failing test**

```ts
// src/spotify/pkce.test.ts
import { describe, expect, it } from 'vitest'
import { deriveChallenge, generateVerifier } from './pkce'

describe('pkce', () => {
  // RFC 7636 Appendix B vector.
  it('derives the S256 challenge from a known verifier', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    expect(await deriveChallenge(verifier)).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    )
  })

  it('generates a verifier in the RFC length range with url-safe chars', () => {
    const v = generateVerifier()
    expect(v.length).toBeGreaterThanOrEqual(43)
    expect(v.length).toBeLessThanOrEqual(128)
    expect(v).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/spotify/pkce.test.ts`
Expected: FAIL ("Cannot find module './pkce'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/spotify/pkce.ts

/** base64url-encode bytes (no padding), per RFC 7636. */
function base64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** A high-entropy code verifier (RFC 7636: 43-128 url-safe chars). */
export function generateVerifier(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64url(bytes)
}

/** S256 challenge = base64url(SHA-256(verifier)). */
export async function deriveChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return base64url(new Uint8Array(digest))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/spotify/pkce.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/pkce.ts src/spotify/pkce.test.ts
git commit -m "feat(spotify): PKCE verifier + S256 challenge (#1)"
```

---

## Task 6: Auth (URL, token exchange/refresh, storage)

**Files:**

- Create: `src/spotify/auth.ts`
- Test: `src/spotify/auth.test.ts`

Pure/injectable parts are unit-tested with a fake `fetch`; the browser redirect itself is verified manually. `localStorage`/`sessionStorage` exist under jsdom.

- [ ] **Step 1: Write the failing test**

```ts
// src/spotify/auth.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SCOPES,
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  isExpired,
  loadTokens,
  saveTokens,
  clearTokens,
} from './auth'

afterEach(() => localStorage.clear())

describe('buildAuthorizeUrl', () => {
  it('includes PKCE + client params', () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: 'cid',
        redirectUri: 'http://127.0.0.1:5173/callback',
        challenge: 'chal',
      }),
    )
    expect(url.origin + url.pathname).toBe(
      'https://accounts.spotify.com/authorize',
    )
    expect(url.searchParams.get('client_id')).toBe('cid')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('code_challenge')).toBe('chal')
    expect(url.searchParams.get('scope')).toBe(SCOPES.join(' '))
  })
})

describe('exchangeCodeForTokens', () => {
  it('POSTs the code and maps the token response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'AT',
        refresh_token: 'RT',
        expires_in: 3600,
      }),
    })
    const tokens = await exchangeCodeForTokens({
      code: 'CODE',
      verifier: 'VER',
      clientId: 'cid',
      redirectUri: 'http://127.0.0.1:5173/callback',
      now: 1000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(tokens).toEqual({
      accessToken: 'AT',
      refreshToken: 'RT',
      expiresAt: 1000 + 3600 * 1000,
    })
    const [endpoint, init] = fetchImpl.mock.calls[0]
    expect(endpoint).toBe('https://accounts.spotify.com/api/token')
    expect((init.body as URLSearchParams).get('grant_type')).toBe(
      'authorization_code',
    )
    expect((init.body as URLSearchParams).get('code_verifier')).toBe('VER')
  })
})

describe('isExpired', () => {
  it('treats tokens within a 60s skew as expired', () => {
    const t = { accessToken: 'a', refreshToken: 'r', expiresAt: 10_000 }
    expect(isExpired(t, 9_000)).toBe(true) // within 60s skew window
    expect(isExpired(t, 1_000)).toBe(false)
  })
})

describe('token storage', () => {
  it('saves and loads tokens', () => {
    const t = { accessToken: 'a', refreshToken: 'r', expiresAt: 5 }
    saveTokens(t)
    expect(loadTokens()).toEqual(t)
    clearTokens()
    expect(loadTokens()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/spotify/auth.test.ts`
Expected: FAIL ("Cannot find module './auth'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/spotify/auth.ts
import type { SpotifyTokens } from './types'

const AUTHORIZE = 'https://accounts.spotify.com/authorize'
const TOKEN = 'https://accounts.spotify.com/api/token'
const TOKENS_KEY = 'chrono.spotify.tokens'
const VERIFIER_KEY = 'chrono.spotify.verifier'
const EXPIRY_SKEW_MS = 60_000

/** streaming + user-read-* are required by the Web Playback SDK; modify lets us
 * start playback on our device. */
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
]

export function buildAuthorizeUrl(args: {
  clientId: string
  redirectUri: string
  challenge: string
}): string {
  const params = new URLSearchParams({
    client_id: args.clientId,
    response_type: 'code',
    redirect_uri: args.redirectUri,
    code_challenge_method: 'S256',
    code_challenge: args.challenge,
    scope: SCOPES.join(' '),
  })
  return `${AUTHORIZE}?${params.toString()}`
}

function mapTokenResponse(
  data: { access_token: string; refresh_token?: string; expires_in: number },
  now: number,
  fallbackRefresh?: string,
): SpotifyTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? fallbackRefresh ?? '',
    expiresAt: now + data.expires_in * 1000,
  }
}

export async function exchangeCodeForTokens(args: {
  code: string
  verifier: string
  clientId: string
  redirectUri: string
  now?: number
  fetchImpl?: typeof fetch
}): Promise<SpotifyTokens> {
  const f = args.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: args.clientId,
    code_verifier: args.verifier,
  })
  const res = await f(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  return mapTokenResponse(await res.json(), args.now ?? Date.now())
}

export async function refreshTokens(args: {
  refreshToken: string
  clientId: string
  now?: number
  fetchImpl?: typeof fetch
}): Promise<SpotifyTokens> {
  const f = args.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: args.refreshToken,
    client_id: args.clientId,
  })
  const res = await f(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  return mapTokenResponse(
    await res.json(),
    args.now ?? Date.now(),
    args.refreshToken,
  )
}

export function isExpired(tokens: SpotifyTokens, now = Date.now()): boolean {
  return now >= tokens.expiresAt - EXPIRY_SKEW_MS
}

export function saveTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function loadTokens(): SpotifyTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  return raw ? (JSON.parse(raw) as SpotifyTokens) : null
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY)
}

export function saveVerifier(verifier: string): void {
  sessionStorage.setItem(VERIFIER_KEY, verifier)
}

export function takeVerifier(): string | null {
  const v = sessionStorage.getItem(VERIFIER_KEY)
  if (v) sessionStorage.removeItem(VERIFIER_KEY)
  return v
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/spotify/auth.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/auth.ts src/spotify/auth.test.ts
git commit -m "feat(spotify): PKCE auth url, token exchange/refresh, storage (#1)"
```

---

## Task 7: Web API playlist client

**Files:**

- Create: `src/spotify/client.ts`
- Test: `src/spotify/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/spotify/client.test.ts
import { describe, expect, it, vi } from 'vitest'
import { fetchPlaylistTracks, parsePlaylistId, parseYear } from './client'

describe('parsePlaylistId', () => {
  const ID = '37i9dQZF1DXcBWIGoYBM5M'
  it('parses url, uri, and bare id', () => {
    expect(
      parsePlaylistId(`https://open.spotify.com/playlist/${ID}?si=x`),
    ).toBe(ID)
    expect(parsePlaylistId(`spotify:playlist:${ID}`)).toBe(ID)
    expect(parsePlaylistId(ID)).toBe(ID)
  })
  it('returns null for junk', () => {
    expect(parsePlaylistId('not a playlist')).toBeNull()
    expect(parsePlaylistId('')).toBeNull()
  })
})

describe('parseYear', () => {
  it('reads the leading year from a release_date', () => {
    expect(parseYear('1975-10-31')).toBe(1975)
    expect(parseYear('1969')).toBe(1969)
    expect(parseYear('')).toBeNull()
  })
})

describe('fetchPlaylistTracks', () => {
  it('maps items to SpotifyTrack[] across pages', async () => {
    const page1 = {
      items: [
        {
          track: {
            id: 'T1',
            uri: 'spotify:track:T1',
            name: 'Song One',
            artists: [{ name: 'Artist A' }],
            album: { release_date: '1980-01-01' },
          },
        },
      ],
      next: 'https://api.spotify.com/v1/next-page',
    }
    const page2 = {
      items: [
        {
          track: {
            id: 'T2',
            uri: 'spotify:track:T2',
            name: 'Song Two',
            artists: [{ name: 'Artist B' }],
            album: { release_date: '1991' },
          },
        },
      ],
      next: null,
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 })

    const tracks = await fetchPlaylistTracks({
      playlistId: 'PL',
      accessToken: 'AT',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(tracks).toEqual([
      {
        id: 'T1',
        uri: 'spotify:track:T1',
        title: 'Song One',
        artist: 'Artist A',
        year: 1980,
      },
      {
        id: 'T2',
        uri: 'spotify:track:T2',
        title: 'Song Two',
        artist: 'Artist B',
        year: 1991,
      },
    ])
    // first call hits the playlist endpoint with a bearer token
    const [firstUrl, firstInit] = fetchImpl.mock.calls[0]
    expect(String(firstUrl)).toContain('/playlists/PL/tracks')
    expect(firstInit.headers.Authorization).toBe('Bearer AT')
  })

  it('throws on a non-ok response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401 })
    await expect(
      fetchPlaylistTracks({
        playlistId: 'PL',
        accessToken: 'AT',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/401/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/spotify/client.test.ts`
Expected: FAIL ("Cannot find module './client'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/spotify/client.ts
import type { SpotifyTrack } from './types'

const API = 'https://api.spotify.com/v1'

export function parsePlaylistId(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  const m =
    s.match(/playlist[/:]([A-Za-z0-9]+)/) ??
    (/^[A-Za-z0-9]+$/.test(s) ? [s, s] : null)
  return m ? m[1] : null
}

export function parseYear(releaseDate: string): number | null {
  const m = releaseDate.match(/^(\d{4})/)
  return m ? Number(m[1]) : null
}

interface RawItem {
  track: {
    id: string
    uri: string
    name: string
    artists: { name: string }[]
    album: { release_date: string }
  } | null
}

export function mapTrack(item: RawItem): SpotifyTrack | null {
  const t = item.track
  if (!t || !t.id) return null
  return {
    id: t.id,
    uri: t.uri,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    year: parseYear(t.album?.release_date ?? ''),
  }
}

export async function fetchPlaylistTracks(args: {
  playlistId: string
  accessToken: string
  fetchImpl?: typeof fetch
}): Promise<SpotifyTrack[]> {
  const f = args.fetchImpl ?? fetch
  const headers = { Authorization: `Bearer ${args.accessToken}` }
  let url: string | null =
    `${API}/playlists/${args.playlistId}/tracks?limit=100`
  const out: SpotifyTrack[] = []
  while (url) {
    const res = await f(url, { headers })
    if (!res.ok) throw new Error(`Playlist fetch failed: ${res.status}`)
    const page = (await res.json()) as { items: RawItem[]; next: string | null }
    for (const item of page.items) {
      const mapped = mapTrack(item)
      if (mapped) out.push(mapped)
    }
    url = page.next
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/spotify/client.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/client.ts src/spotify/client.test.ts
git commit -m "feat(spotify): playlist parsing + paged track fetch (#1)"
```

---

## Task 8: Web Playback SDK loader

**Files:**

- Create: `src/spotify/sdk.ts`
- Test: `src/spotify/sdk.test.ts`

`createConnectedPlayer` takes the `Spotify` global as an injectable arg so it can be tested with a fake player. `loadSdk` (the real script injection) is exercised manually.

- [ ] **Step 1: Write the failing test**

```ts
// src/spotify/sdk.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createConnectedPlayer } from './sdk'

function fakeSpotify(deviceId: string) {
  const listeners: Record<string, (arg: unknown) => void> = {}
  const player = {
    addListener: vi.fn((event: string, cb: (arg: unknown) => void) => {
      listeners[event] = cb
    }),
    connect: vi.fn(async () => {
      // fire 'ready' on next tick
      queueMicrotask(() => listeners['ready']?.({ device_id: deviceId }))
      return true
    }),
    disconnect: vi.fn(),
  }
  const Spotify = {
    Player: vi.fn(() => player),
  } as unknown as typeof window.Spotify
  return { Spotify, player }
}

describe('createConnectedPlayer', () => {
  it('resolves the device id from the ready event', async () => {
    const { Spotify, player } = fakeSpotify('DEV123')
    const result = await createConnectedPlayer({
      name: 'Chrono',
      getToken: () => 'AT',
      spotify: Spotify,
    })
    expect(result.deviceId).toBe('DEV123')
    expect(result.player).toBe(player)
    expect(player.connect).toHaveBeenCalled()
  })

  it('rejects on account_error (non-premium)', async () => {
    const listeners: Record<string, (arg: unknown) => void> = {}
    const player = {
      addListener: vi.fn((e: string, cb: (arg: unknown) => void) => {
        listeners[e] = cb
      }),
      connect: vi.fn(async () => {
        queueMicrotask(() =>
          listeners['account_error']?.({ message: 'not premium' }),
        )
        return true
      }),
      disconnect: vi.fn(),
    }
    const Spotify = {
      Player: vi.fn(() => player),
    } as unknown as typeof window.Spotify
    await expect(
      createConnectedPlayer({
        name: 'Chrono',
        getToken: () => 'AT',
        spotify: Spotify,
      }),
    ).rejects.toThrow(/premium/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/spotify/sdk.test.ts`
Expected: FAIL ("Cannot find module './sdk'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/spotify/sdk.ts

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js'

/** Inject the Web Playback SDK script and resolve when it is ready. */
export function loadSdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve()
  return new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const tag = document.createElement('script')
    tag.src = SDK_SRC
    tag.async = true
    tag.onerror = () => reject(new Error('Failed to load Spotify SDK'))
    document.body.appendChild(tag)
  })
}

export interface ConnectedPlayer {
  deviceId: string
  player: Spotify.Player
}

/** Create + connect a player, resolving its device id. `spotify` is injectable
 * for tests; in the app it defaults to the global loaded by loadSdk(). */
export function createConnectedPlayer(args: {
  name: string
  getToken: () => string
  spotify?: typeof window.Spotify
}): Promise<ConnectedPlayer> {
  const Spotify = args.spotify ?? window.Spotify
  return new Promise((resolve, reject) => {
    const player = new Spotify.Player({
      name: args.name,
      getOAuthToken: (cb) => cb(args.getToken()),
    })
    player.addListener('ready', ({ device_id }) =>
      resolve({ deviceId: device_id, player }),
    )
    player.addListener('account_error', ({ message }) =>
      reject(new Error(`Spotify Premium required: ${message}`)),
    )
    player.addListener('authentication_error', ({ message }) =>
      reject(new Error(`Spotify auth error: ${message}`)),
    )
    player.connect()
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/spotify/sdk.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/sdk.ts src/spotify/sdk.test.ts
git commit -m "feat(spotify): Web Playback SDK loader + connectable player (#1)"
```

---

## Task 9: SpotifyProvider (implements AudioProvider)

**Files:**

- Create: `src/spotify/provider.ts`
- Test: `src/spotify/provider.test.ts`

`play`/`pause`/`stop` are unit-tested with an injected `fetch` and a fixed device id. `connect()` (which wires the SDK) is verified manually.

- [ ] **Step 1: Write the failing test**

```ts
// src/spotify/provider.test.ts
import { describe, expect, it, vi } from 'vitest'
import { SpotifyProvider } from './provider'

function okFetch() {
  return vi
    .fn()
    .mockResolvedValue({ ok: true, status: 204, json: async () => ({}) })
}

describe('SpotifyProvider', () => {
  it('plays a uri on the connected device', async () => {
    const fetchImpl = okFetch()
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: 'DEV1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await p.play({ uri: 'spotify:track:T1' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.spotify.com/v1/me/player/play?device_id=DEV1',
    )
    expect(init.method).toBe('PUT')
    expect(init.headers.Authorization).toBe('Bearer AT')
    expect(JSON.parse(init.body)).toEqual({ uris: ['spotify:track:T1'] })
  })

  it('pauses', async () => {
    const fetchImpl = okFetch()
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: 'DEV1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await p.pause()
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.spotify.com/v1/me/player/pause?device_id=DEV1',
    )
    expect(init.method).toBe('PUT')
  })

  it('throws if play is called before a device id exists', async () => {
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: null,
      fetchImpl: okFetch() as unknown as typeof fetch,
    })
    await expect(p.play({ uri: 'spotify:track:T1' })).rejects.toThrow(
      /connect/i,
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/spotify/provider.test.ts`
Expected: FAIL ("Cannot find module './provider'").

- [ ] **Step 3: Write minimal implementation**

```ts
// src/spotify/provider.ts
import type { AudioProvider, AudioTrackRef } from '@/audio'
import { createConnectedPlayer, loadSdk } from './sdk'

const API = 'https://api.spotify.com/v1'

export class SpotifyProvider implements AudioProvider {
  readonly id = 'spotify'
  private deviceId: string | null
  private readonly getAccessToken: () => string | null
  private readonly fetchImpl: typeof fetch

  constructor(opts: {
    getAccessToken: () => string | null
    deviceId?: string | null
    fetchImpl?: typeof fetch
  }) {
    this.getAccessToken = opts.getAccessToken
    this.deviceId = opts.deviceId ?? null
    this.fetchImpl = opts.fetchImpl ?? fetch
  }

  /** Load the SDK and connect a player; stores the resulting device id. */
  async connect(): Promise<void> {
    await loadSdk()
    const { deviceId } = await createConnectedPlayer({
      name: 'Chrono',
      getToken: () => this.getAccessToken() ?? '',
    })
    this.deviceId = deviceId
  }

  get isConnected(): boolean {
    return this.deviceId !== null
  }

  private async put(path: string, body?: unknown): Promise<void> {
    if (!this.deviceId)
      throw new Error('Player not connected; call connect() first.')
    const token = this.getAccessToken()
    if (!token) throw new Error('Not authenticated.')
    const res = await this.fetchImpl(
      `${API}${path}?device_id=${this.deviceId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    )
    if (!res.ok) throw new Error(`Playback request failed: ${res.status}`)
  }

  async play(track: AudioTrackRef): Promise<void> {
    await this.put('/me/player/play', { uris: [track.uri] })
  }

  async pause(): Promise<void> {
    await this.put('/me/player/pause')
  }

  async stop(): Promise<void> {
    await this.put('/me/player/pause')
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/spotify/provider.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/provider.ts src/spotify/provider.test.ts
git commit -m "feat(spotify): SpotifyProvider play/pause via Web API (#1)"
```

---

## Task 10: Scanner interface + MockScanner + camera scanner

**Files:**

- Create: `src/scan/scanner.ts`
- Create: `src/scan/mock-scanner.ts`
- Test: `src/scan/mock-scanner.test.ts`

The `QrScanner` interface and `MockScanner` are unit-tested. `CameraQrScanner` (real `@zxing/browser`) is verified manually since it needs a camera.

- [ ] **Step 1: Write the failing test**

```ts
// src/scan/mock-scanner.test.ts
import { describe, expect, it, vi } from 'vitest'
import { MockScanner } from './mock-scanner'

describe('MockScanner', () => {
  it('delivers emitted text to the registered callback', async () => {
    const scanner = new MockScanner()
    const onDecode = vi.fn()
    await scanner.start({} as HTMLVideoElement, onDecode)
    scanner.emit('chrono:t:T1')
    expect(onDecode).toHaveBeenCalledWith('chrono:t:T1')
  })

  it('stops delivering after stop()', async () => {
    const scanner = new MockScanner()
    const onDecode = vi.fn()
    await scanner.start({} as HTMLVideoElement, onDecode)
    scanner.stop()
    scanner.emit('chrono:t:T1')
    expect(onDecode).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/scan/mock-scanner.test.ts`
Expected: FAIL ("Cannot find module './mock-scanner'").

- [ ] **Step 3: Write the interface + mock + camera scanner**

```ts
// src/scan/scanner.ts
import { BrowserQRCodeReader } from '@zxing/browser'

/** Decodes QR text from a video stream until stopped. */
export interface QrScanner {
  start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void>
  stop(): void
}

/** Real camera scanner backed by ZXing. Verified manually (needs a camera). */
export class CameraQrScanner implements QrScanner {
  private reader = new BrowserQRCodeReader()
  private controls: { stop: () => void } | null = null

  async start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void> {
    this.controls = await this.reader.decodeFromVideoDevice(
      undefined,
      video,
      (result) => {
        if (result) onDecode(result.getText())
      },
    )
  }

  stop(): void {
    this.controls?.stop()
    this.controls = null
  }
}
```

```ts
// src/scan/mock-scanner.ts
import type { QrScanner } from './scanner'

/** In-memory scanner for tests/E2E. `emit` simulates reading a QR. */
export class MockScanner implements QrScanner {
  private onDecode: ((text: string) => void) | null = null

  async start(
    _video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void> {
    this.onDecode = onDecode
  }

  emit(text: string): void {
    this.onDecode?.(text)
  }

  stop(): void {
    this.onDecode = null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/scan/mock-scanner.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scan/scanner.ts src/scan/mock-scanner.ts src/scan/mock-scanner.test.ts
git commit -m "feat(scan): QrScanner interface, camera + mock scanners (#1)"
```

---

## Task 11: QR image rendering + scan barrel

**Files:**

- Create: `src/scan/qr-image.ts`
- Create: `src/scan/index.ts`
- Test: `src/scan/qr-image.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/scan/qr-image.test.ts
import { describe, expect, it } from 'vitest'
import { renderQrDataUrl } from './qr-image'

describe('renderQrDataUrl', () => {
  it('returns a png data url for a token', async () => {
    const url = await renderQrDataUrl('chrono:t:T1')
    expect(url.startsWith('data:image/png;base64,')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/scan/qr-image.test.ts`
Expected: FAIL ("Cannot find module './qr-image'").

- [ ] **Step 3: Implement + barrel**

```ts
// src/scan/qr-image.ts
import QRCode from 'qrcode'

/** Render text as a PNG data URL suitable for an <img src>. */
export function renderQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 192 })
}
```

```ts
// src/scan/index.ts
export { encodeTrackToken, decodeTrackToken, trackIdToUri } from './token'
export { renderQrDataUrl } from './qr-image'
export type { QrScanner } from './scanner'
export { CameraQrScanner } from './scanner'
export { MockScanner } from './mock-scanner'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/scan/qr-image.test.ts`
Expected: PASS (1 test). Note: the `qrcode` lib renders via a pure JS path under jsdom (no real canvas needed for `toDataURL`).

- [ ] **Step 5: Commit**

```bash
git add src/scan/qr-image.ts src/scan/index.ts src/scan/qr-image.test.ts
git commit -m "feat(scan): QR image rendering + barrel exports (#1)"
```

---

## Task 12: Spotify barrel exports

**Files:**

- Create: `src/spotify/index.ts`

- [ ] **Step 1: Create the barrel**

```ts
// src/spotify/index.ts
export type { SpotifyConfig } from './config'
export { getSpotifyConfig } from './config'
export type { SpotifyTokens, SpotifyTrack, PlaylistImportResult } from './types'
export { generateVerifier, deriveChallenge } from './pkce'
export {
  SCOPES,
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  refreshTokens,
  isExpired,
  saveTokens,
  loadTokens,
  clearTokens,
  saveVerifier,
  takeVerifier,
} from './auth'
export { parsePlaylistId, parseYear, fetchPlaylistTracks } from './client'
export { SpotifyProvider } from './provider'
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/spotify/index.ts
git commit -m "feat(spotify): barrel exports (#1)"
```

---

## Task 13: Dependency factory (real vs mock)

**Files:**

- Create: `src/ui/spike-deps.ts`
- Test: `src/ui/spike-deps.test.ts`

`createSpikeDeps` returns mock provider + scanner when the URL query contains `mock=1`. The MockScanner instance is returned so the harness can render a "simulate scan" control in mock mode.

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/spike-deps.test.ts
import { describe, expect, it } from 'vitest'
import { MockProvider } from '@/audio'
import { MockScanner } from '@/scan'
import { createSpikeDeps } from './spike-deps'

describe('createSpikeDeps', () => {
  it('returns mock provider + scanner when mock=1', () => {
    const deps = createSpikeDeps('?mock=1')
    expect(deps.mock).toBe(true)
    expect(deps.provider).toBeInstanceOf(MockProvider)
    expect(deps.scanner).toBeInstanceOf(MockScanner)
  })

  it('returns the real provider otherwise', () => {
    const deps = createSpikeDeps('')
    expect(deps.mock).toBe(false)
    expect(deps.provider.id).toBe('spotify')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/ui/spike-deps.test.ts`
Expected: FAIL ("Cannot find module './spike-deps'").

- [ ] **Step 3: Implement**

```ts
// src/ui/spike-deps.ts
import { MockProvider, type AudioProvider } from '@/audio'
import { CameraQrScanner, MockScanner, type QrScanner } from '@/scan'
import { SpotifyProvider, loadTokens } from '@/spotify'

export interface SpikeDeps {
  mock: boolean
  provider: AudioProvider
  scanner: QrScanner
}

export function createSpikeDeps(search: string): SpikeDeps {
  const isMock = new URLSearchParams(search).get('mock') === '1'
  if (isMock) {
    return {
      mock: true,
      provider: new MockProvider(),
      scanner: new MockScanner(),
    }
  }
  return {
    mock: false,
    provider: new SpotifyProvider({
      getAccessToken: () => loadTokens()?.accessToken ?? null,
    }),
    scanner: new CameraQrScanner(),
  }
}
```

Note: `loadTokens` must be re-exported from `src/spotify/index.ts` (it is, per Task 12).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/ui/spike-deps.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/spike-deps.ts src/ui/spike-deps.test.ts
git commit -m "feat(ui): spike dependency factory (real vs mock) (#1)"
```

---

## Task 14: SpikeHarness UI

**Files:**

- Create: `src/ui/SpikeHarness.tsx`
- Modify: `src/ui/App.tsx`

This is DOM-heavy and verified by E2E (Task 15) + manual (Task 16). No standalone unit test.

- [ ] **Step 1: Implement the harness**

```tsx
// src/ui/SpikeHarness.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildAuthorizeUrl,
  deriveChallenge,
  exchangeCodeForTokens,
  fetchPlaylistTracks,
  generateVerifier,
  getSpotifyConfig,
  loadTokens,
  parsePlaylistId,
  saveTokens,
  saveVerifier,
  takeVerifier,
  type SpotifyTrack,
} from '@/spotify'
import {
  decodeTrackToken,
  encodeTrackToken,
  renderQrDataUrl,
  trackIdToUri,
} from '@/scan'
import { SpotifyProvider } from '@/spotify'
import { createSpikeDeps } from './spike-deps'

type Card = SpotifyTrack & { qr: string }

export default function SpikeHarness() {
  const deps = useMemo(() => createSpikeDeps(window.location.search), [])
  const [loggedIn, setLoggedIn] = useState(deps.mock || !!loadTokens())
  const [connected, setConnected] = useState(deps.mock)
  const [playlist, setPlaylist] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle the OAuth callback once on mount.
  useEffect(() => {
    if (deps.mock) return
    if (window.location.pathname !== '/callback') return
    const code = new URLSearchParams(window.location.search).get('code')
    const verifier = takeVerifier()
    if (!code || !verifier) return
    const { clientId, redirectUri } = getSpotifyConfig()
    exchangeCodeForTokens({ code, verifier, clientId, redirectUri })
      .then((tokens) => {
        saveTokens(tokens)
        window.history.replaceState({}, '', '/')
        setLoggedIn(true)
      })
      .catch((e) => setError(String(e)))
  }, [deps.mock])

  // In mock mode, pre-seed two cards so the flow needs no Spotify.
  useEffect(() => {
    if (!deps.mock) return
    const seed: SpotifyTrack[] = [
      {
        id: 'MOCK1',
        uri: 'spotify:track:MOCK1',
        title: 'Mock Song',
        artist: 'Mock Artist',
        year: 1999,
      },
      {
        id: 'MOCK2',
        uri: 'spotify:track:MOCK2',
        title: 'Second Mock',
        artist: 'Mock Artist',
        year: 2008,
      },
    ]
    Promise.all(
      seed.map(async (t) => ({
        ...t,
        qr: await renderQrDataUrl(encodeTrackToken(t.id)),
      })),
    ).then(setCards)
  }, [deps.mock])

  async function login() {
    try {
      const { clientId, redirectUri } = getSpotifyConfig()
      const verifier = generateVerifier()
      saveVerifier(verifier)
      const challenge = await deriveChallenge(verifier)
      window.location.href = buildAuthorizeUrl({
        clientId,
        redirectUri,
        challenge,
      })
    } catch (e) {
      setError(String(e))
    }
  }

  async function connect() {
    try {
      await (deps.provider as SpotifyProvider).connect()
      setConnected(true)
    } catch (e) {
      setError(String(e))
    }
  }

  async function importPlaylist() {
    setError(null)
    const id = parsePlaylistId(playlist)
    if (!id) return setError('Could not parse a playlist id from that input.')
    const token = loadTokens()?.accessToken
    if (!token) return setError('Log in first.')
    try {
      const tracks = await fetchPlaylistTracks({
        playlistId: id,
        accessToken: token,
      })
      const withQr = await Promise.all(
        tracks.map(async (t) => ({
          ...t,
          qr: await renderQrDataUrl(encodeTrackToken(t.id)),
        })),
      )
      setCards(withQr)
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleDecode(text: string) {
    const id = decodeTrackToken(text)
    if (!id) return
    const card = cards.find((c) => c.id === id) ?? null
    setRevealed(false)
    setNowPlaying(card)
    try {
      await deps.provider.play(trackIdToUri(id))
    } catch (e) {
      setError(String(e))
    }
  }

  async function startScanning() {
    setScanning(true)
    if (videoRef.current)
      await deps.scanner.start(videoRef.current, handleDecode)
  }

  function stopScanning() {
    deps.scanner.stop()
    setScanning(false)
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Chrono spike: playback + scan</h1>
      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-6 flex flex-wrap gap-3">
        {!loggedIn && (
          <button
            className="rounded bg-green-600 px-4 py-2 text-white"
            onClick={login}
          >
            Log in with Spotify
          </button>
        )}
        {loggedIn && !connected && (
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={connect}
          >
            Connect player
          </button>
        )}
        {connected && (
          <span className="self-center text-sm text-green-700">
            Player ready
          </span>
        )}
      </section>

      {loggedIn && !deps.mock && (
        <section className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2"
            placeholder="Paste a Spotify playlist link"
            value={playlist}
            onChange={(e) => setPlaylist(e.target.value)}
          />
          <button
            className="rounded bg-neutral-800 px-4 py-2 text-white"
            onClick={importPlaylist}
          >
            Import
          </button>
        </section>
      )}

      {cards.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-3">
            {!scanning ? (
              <button
                className="rounded bg-purple-600 px-4 py-2 text-white"
                onClick={startScanning}
              >
                Start scanning
              </button>
            ) : (
              <button
                className="rounded bg-neutral-500 px-4 py-2 text-white"
                onClick={stopScanning}
              >
                Stop scanning
              </button>
            )}
            {deps.mock && scanning && (
              <button
                data-testid="simulate-scan"
                className="rounded bg-amber-500 px-4 py-2 text-white"
                onClick={() => handleDecode(encodeTrackToken(cards[0].id))}
              >
                Simulate scan
              </button>
            )}
          </div>

          {!deps.mock && (
            <video
              ref={videoRef}
              className="mt-4 w-full max-w-sm rounded border"
              muted
              playsInline
            />
          )}

          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <li key={c.id} className="rounded border p-2 text-center">
                <img
                  src={c.qr}
                  alt=""
                  className="mx-auto"
                  width={120}
                  height={120}
                />
                <p className="mt-1 text-xs text-neutral-400">card</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nowPlaying && (
        <section
          className="mt-8 rounded-lg border p-5"
          data-testid="now-playing"
        >
          <p className="text-lg font-semibold">Now playing (hidden)</p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => deps.provider.pause()}
            >
              Pause
            </button>
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => deps.provider.stop()}
            >
              Stop
            </button>
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => setRevealed(true)}
            >
              Reveal
            </button>
          </div>
          {revealed && (
            <p className="mt-3 text-sm" data-testid="reveal">
              {nowPlaying.title}, {nowPlaying.artist} (
              {nowPlaying.year ?? 'unknown'})
            </p>
          )}
        </section>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Render the harness from App**

Replace `src/ui/App.tsx` with:

```tsx
// src/ui/App.tsx
import SpikeHarness from './SpikeHarness'

export default function App() {
  return <SpikeHarness />
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run build && npm run lint`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/ui/SpikeHarness.tsx src/ui/App.tsx
git commit -m "feat(ui): spike harness wiring login, import, scan, playback (#1)"
```

---

## Task 15: E2E mock-path test

**Files:**

- Create: `e2e/spike.spec.ts`

Drives the harness with `?mock=1` so no real Spotify, camera, or Premium is involved. Asserts a simulated scan reaches the provider and surfaces "Now playing".

- [ ] **Step 1: Write the test**

```ts
// e2e/spike.spec.ts
import { expect, test } from '@playwright/test'

test('mock scan starts playback and shows Now playing', async ({ page }) => {
  await page.goto('/?mock=1')

  // Mock mode is pre-logged-in and pre-connected.
  await expect(page.getByText('Player ready')).toBeVisible()

  // Seed cards render, then start scanning + simulate a scan.
  await page.getByRole('button', { name: 'Start scanning' }).click()
  await page.getByTestId('simulate-scan').click()

  await expect(page.getByTestId('now-playing')).toBeVisible()
  await expect(page.getByText('Now playing (hidden)')).toBeVisible()

  // Reveal shows the (mock) identity.
  await page.getByRole('button', { name: 'Reveal' }).click()
  await expect(page.getByTestId('reveal')).toContainText('Mock Song')
})
```

- [ ] **Step 2: Run the E2E test**

Run: `npm run test:e2e -- spike.spec.ts`
Expected: PASS. (Playwright auto-starts the dev server per `playwright.config.ts`.)

- [ ] **Step 3: Commit**

```bash
git add e2e/spike.spec.ts
git commit -m "test(e2e): mock-path scan -> playback (#1)"
```

---

## Task 16: Full verification + manual proof + README

**Files:**

- Modify: `README.md` (status line)

- [ ] **Step 1: Run the whole verification loop**

Run:

```bash
npm run lint && npm run test && npm run build && npm run test:e2e
```

Expected: all green. Fix anything that fails before continuing.

- [ ] **Step 2: Manual proof on a real Premium account**

1. Ensure `.env` has `VITE_SPOTIFY_CLIENT_ID` set and `VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback`.
2. Run `npm run dev`, open `http://127.0.0.1:5173` (use `127.0.0.1`, not `localhost`, so the origin matches the redirect URI).
3. Click "Log in with Spotify", authorize.
4. Click "Connect player", wait for "Player ready".
5. Paste a Spotify playlist link, click "Import"; confirm QR cards appear.
6. Click "Start scanning", point the webcam at one of the on-screen QR cards.
7. Confirm the full track plays, "Now playing (hidden)" appears, Pause/Stop work, and Reveal shows the title/artist/year.

Record the result (pass/fail + any issues) in the PR description.

- [ ] **Step 3: Update README status**

In `README.md`, change the Status section from the Phase 0 line to:

```markdown
## Status

Phase 0 complete. Phase 1 Slice 1 (Spotify playback + QR-scan spike) is in
progress. See [`roadmap.md`](./roadmap.md) and the spec under
`docs/superpowers/specs/`.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: mark Phase 1 Slice 1 spike in progress (#1)"
```

- [ ] **Step 5: Open the PR**

```bash
git push -u origin HEAD
gh pr create --fill --base main \
  --title "Phase 1 Slice 1: Hitster playback + QR-scan spike" \
  --body "Implements the spike from docs/superpowers/specs/2026-06-03-hitster-playback-scan-spike-design.md. Closes #1.

Manual proof on a Premium account: <paste result here>."
```

---

## Self-review (completed by plan author)

**Spec coverage:**

- Login (PKCE) -> Tasks 5, 6, 14. Connect/playback (SDK + provider) -> Tasks 8, 9, 14. Playlist import by link -> Task 7, 14. QR encode/decode -> Task 2. QR images -> Task 11. Camera + mock scanners -> Task 10. Harness flow (reveal/pause/stop) -> Task 14. Mock `?mock=1` path -> Tasks 13, 14, 15. Config + env typing -> Task 4. Error handling table -> surfaced via `setError` in Task 14 and thrown errors in Tasks 6-9. Testing strategy -> unit tests per task + E2E Task 15 + manual Task 16. Out-of-scope items (template playlists, own-playlist picker, phone/HTTPS) are intentionally not tasked.
- Gap check: none found. Every in-scope spec requirement maps to a task.

**Placeholder scan:** No TBD/TODO; every code step has full code. The single prose `<paste result here>` in the PR step is an intentional human input, not a code placeholder.

**Type consistency:** `SpotifyTokens`/`SpotifyTrack`/`PlaylistImportResult` defined in Task 3 and used unchanged after. `AudioProvider`/`AudioTrackRef` come from the existing `src/audio`. `SpotifyProvider` constructor shape (`getAccessToken`, `deviceId`, `fetchImpl`) is identical in Tasks 9 and 13. `QrScanner` (`start`/`stop`) consistent across Tasks 10, 13, 14. `createConnectedPlayer` arg `spotify` matches between Tasks 8 and 9. Token storage names (`loadTokens`/`saveTokens`/`takeVerifier`) consistent across Tasks 6, 13, 14.

No-em-dash rule honoured: the Task 14 reveal JSX uses a comma separator, not an em-dash.
