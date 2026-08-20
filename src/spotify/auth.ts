// src/spotify/auth.ts
import { getSpotifyConfig } from './config'
import type { SpotifyTokens } from './types'

const AUTHORIZE = 'https://accounts.spotify.com/authorize'
const TOKEN = 'https://accounts.spotify.com/api/token'
const TOKENS_KEY = 'chrono.spotify.tokens'
const VERIFIER_KEY = 'chrono.spotify.verifier'
const EXPIRY_SKEW_MS = 60_000

/** streaming + user-read-* are required by the Web Playback SDK; modify lets us
 * start playback on our device; playlist-read-* lets us import the user's
 * private and collaborative playlists (public ones need no scope). */
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
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
    // Force the consent screen so newly added scopes (e.g. playlist-read-*) are
    // actually granted rather than silently reusing a prior, narrower grant.
    show_dialog: 'true',
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

// Concurrent callers (the SDK's getOAuthToken and a REST call can race) share
// one refresh request instead of each spending the single-use refresh token.
let refreshInFlight: Promise<SpotifyTokens | null> | null = null

/**
 * Stored tokens, silently refreshed first when the access token has expired.
 * Returns null when there are no tokens, no refresh token, or the refresh
 * fails (the caller then falls back to the login flow).
 */
export async function ensureFreshTokens(args?: {
  clientId?: string
  now?: number
  fetchImpl?: typeof fetch
}): Promise<SpotifyTokens | null> {
  const tokens = loadTokens()
  if (!tokens) return null
  if (!isExpired(tokens, args?.now)) return tokens
  if (!tokens.refreshToken) return null
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens({
      refreshToken: tokens.refreshToken,
      clientId: args?.clientId ?? getSpotifyConfig().clientId,
      now: args?.now,
      fetchImpl: args?.fetchImpl,
    })
      .then((next) => {
        saveTokens(next)
        return next
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export function saveTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function loadTokens(): SpotifyTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SpotifyTokens
  } catch {
    // A corrupted entry must not crash the app; treat it as logged out.
    localStorage.removeItem(TOKENS_KEY)
    return null
  }
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

/** Read the verifier WITHOUT consuming it. The OAuth callback peeks (so a
 * double-processed callback or a retry still sees it) and clears it only after
 * the token exchange succeeds (see clearVerifier). */
export function peekVerifier(): string | null {
  return sessionStorage.getItem(VERIFIER_KEY)
}

export function clearVerifier(): void {
  sessionStorage.removeItem(VERIFIER_KEY)
}
