# Hitster playback + QR-scan spike: design

Date: 2026-06-03
Status: approved (pending spec review)
Phase: 1, Slice 1

## Context

Chrono is a platform for timeline-guessing card games on a shared engine. Phase 1
is "Hitster, single-device." Phase 1 as written is five independent subsystems
(game engine, Spotify auth, playlist import, playback, game UI). Rather than spec
all of it at once, this document covers a focused first slice.

## Goal

A vertical **tech spike** that proves the two risky, unfamiliar pieces work
together inside our own page:

1. **Spotify full-track playback in-browser** via the Web Playback SDK (Premium,
   host login, no app switch).
2. **In-page QR scanning** that resolves a scanned card to a track and plays it,
   driven from a real **playlist link** the user pastes.

This is a throwaway-grade test harness to answer "does this tech work?", not
shippable game UI.

## Non-goals (explicitly out of scope for this slice)

- No game engine, turns, rounds, scoring, or win condition.
- No polished or final UI. A bare dev harness only.
- No curated "template" playlists.
- No "connect account and pick from your own playlists" browser/picker. (Later.)
- No phone testing / HTTPS tunnel. Desktop `http://127.0.0.1:5173` only.
- No online multiplayer, no native build.

## Success criteria (definition of done)

- The user logs in with Spotify Premium, pastes a playlist link, sees the
  playlist's tracks rendered as QR cards.
- Scanning a card with the in-page camera plays the **full track** in the browser
  tab with its identity hidden, plus a Reveal that shows the title/artist/year.
- Pause and Stop work.
- `npm run lint`, `npm run test`, `npm run build` are green; the mock-path E2E
  passes in CI without touching Spotify, a camera, or Premium.
- Verified manually on the developer's machine (real Premium account).

## Principle that shapes the design

**Players never leave our page.** No app switch, no navigating to Spotify. The
scan therefore happens through our own in-page camera scanner (not the phone's
native camera, which would try to open a link), and the QR encodes an **opaque
app token, not a navigable URL**. Playback happens in our browser tab via the
Web Playback SDK.

## Architecture and module layout

`src/audio/` stays the pure playback interface + mock (unchanged). All concrete
Spotify integration lives in a new `src/spotify/` module. The Spotify provider
`implements AudioProvider` from `src/audio`, so the interface boundary is
preserved while the implementation is isolated. `src/core/` is untouched and
stays pure.

```
src/
  audio/                  (unchanged) AudioProvider interface + MockProvider
  spotify/
    config.ts             read VITE_SPOTIFY_CLIENT_ID / REDIRECT_URI; friendly error if missing
    auth.ts               PKCE: build auth URL, handle /callback, store + refresh tokens
    auth.test.ts          PKCE challenge derivation, token-expiry logic (pure parts)
    client.ts             Web API client: fetch playlist tracks + metadata
    client.test.ts        playlist parsing against fixture JSON (injected fetch)
    sdk.ts                load Web Playback SDK, create + connect player, resolve device_id
    provider.ts           SpotifyProvider implements AudioProvider (play/pause/stop via Web API + device_id)
    provider.test.ts      play/pause issue correct Web API calls (injected fetch)
    types.ts              SpotifyTrack, PlaylistImportResult, token types
    index.ts
  scan/
    token.ts              PURE codec: encodeTrackToken / decodeTrackToken / trackIdToUri
    token.test.ts         roundtrip + bad-input rejection (no DOM)
    scanner.ts            QrScanner interface + camera impl (@zxing/browser)
    mock-scanner.ts       MockScanner for tests/E2E (emits a preset token)
    index.ts
  ui/
    SpikeHarness.tsx      the bare dev page wiring login -> import -> scan -> play
    App.tsx               (unchanged or minimal link to the harness)
```

## Component design

### config.ts

Reads `import.meta.env.VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_REDIRECT_URI`.
Throws a clear, actionable error if the client ID is missing so a misconfigured
`.env` fails loudly rather than mid-OAuth.

### auth.ts (PKCE, no client secret)

- Generate a random `code_verifier` and S256 `code_challenge`. Store the verifier
  in `sessionStorage` across the redirect.
- Build the authorize URL for `accounts.spotify.com/authorize` with scopes
  **`streaming user-read-email user-read-private user-modify-playback-state`**.
  (`streaming` + the two `user-read-*` are required by the Web Playback SDK;
  `user-modify-playback-state` is required to start playback on our device.)
- On return to `/callback`, exchange `code` + `code_verifier` at
  `accounts.spotify.com/api/token` for access + refresh tokens.
- Persist tokens in `localStorage` so dev reloads do not force re-login. Refresh
  when expired; on refresh failure, clear and force re-login.
- The pure, testable parts (challenge derivation with injected randomness, expiry
  check) are unit-tested; the redirect itself is exercised manually.

Security note: storing tokens in `localStorage` is acceptable for a local spike
but is not hardened (XSS-readable). Flagged for the real Phase 1 build, not fixed
here.

### client.ts (Web API, non-playback)

- Parse a pasted playlist **link or raw ID** (`https://open.spotify.com/playlist/<id>...`,
  `spotify:playlist:<id>`, or a bare id) into a playlist id.
- `GET /v1/playlists/{id}/tracks` (paged) -> map to `SpotifyTrack { id, uri,
title, artist, year }`. `year` is parsed from `album.release_date`.
- Returns a `PlaylistImportResult`. Network/auth errors surface as typed failures
  the harness can show.

Known gotcha (from project CLAUDE.md): `release_date` is sometimes a
reissue/remaster year, not the original. Irrelevant to whether the pipeline works,
so for the spike we just display whatever Spotify returns; a manual override /
MusicBrainz cross-check is a later refinement.

### sdk.ts (Web Playback SDK)

- Inject `https://sdk.scdn.co/spotify-player.js`, define
  `window.onSpotifyWebPlaybackSDKReady`.
- Create `new Spotify.Player({ name: 'Chrono', getOAuthToken })`, `connect()`,
  resolve our `device_id` from the `ready` event. Surface `account_error`
  (not Premium) and `authentication_error` to the caller.

### provider.ts (SpotifyProvider implements AudioProvider)

- A SpotifyProvider-specific `connect()` (not on the shared interface) loads the
  SDK and resolves `device_id`. Keeps `AudioProvider` clean (still just
  play/pause/stop).
- `play({ uri })` -> `PUT /v1/me/player/play?device_id=<id>` with `{ uris: [uri] }`.
- `pause()` / `stop()` -> `PUT /v1/me/player/pause`.
- Unit-tested with an injected `fetch` asserting URL, method, device_id, body.

### scan/token.ts (pure codec)

- `encodeTrackToken(trackId) -> "chrono:t:<id>"`.
- `decodeTrackToken(text) -> trackId | null` (null for any non-chrono QR).
- `trackIdToUri(id) -> { uri: "spotify:track:<id>" }` (an `AudioTrackRef`).
- Pure, no DOM, fully unit-tested. Opaque token (not a URL) structurally enforces
  "scan only through our app."

### scan/scanner.ts and mock-scanner.ts

- `QrScanner` interface: `start(video, onDecode)` / `stop()`.
- Camera impl uses `@zxing/browser` `BrowserQRCodeReader.decodeFromVideoDevice`
  against a `<video>` fed by `getUserMedia` (works on the `127.0.0.1` secure
  context). Non-chrono decodes are ignored; scanning continues.
- `MockScanner` emits a preset token on demand, for unit/E2E with no camera.

### ui/SpikeHarness.tsx

Flow: `Log in with Spotify` -> on `/callback` exchange + store -> `Connect player`
(shows "ready / device id") -> paste playlist link + `Import` (renders one QR per
track via the `qrcode` lib) -> `Start scanning` opens the camera -> scan a card
-> full track plays, UI shows **"Now playing (hidden)"** + `Reveal`
(title/artist/year) + Pause/Stop. Bare Tailwind, obviously a harness.

Dependency injection: the harness obtains its provider and scanner from a small
factory that returns `MockProvider` + `MockScanner` when a `?mock=1` query flag is
set, so Playwright drives the wiring without real Spotify or camera.

## Data flow

```
paste playlist link
  -> client.parsePlaylistId -> GET playlist tracks (access token)
  -> SpotifyTrack[] -> render QR per track (encodeTrackToken)
scan QR (camera)
  -> decodeTrackToken -> trackIdToUri
  -> SpotifyProvider.play(uri) -> PUT /me/player/play?device_id=... { uris:[uri] }
  -> Web Playback SDK device (this tab) plays the full track
```

## Error handling

| Condition                        | Behaviour                                            |
| -------------------------------- | ---------------------------------------------------- |
| Missing `VITE_SPOTIFY_CLIENT_ID` | Harness shows a config error, no OAuth attempted     |
| Auth denied / state mismatch     | Show message + retry login                           |
| Access token expired             | Refresh; on refresh failure, clear tokens + re-login |
| Not Premium (`account_error`)    | Show "Spotify Premium required"                      |
| Playlist fetch fails / bad link  | Show the failure, keep prior cards                   |
| Camera denied / absent           | Show message, scanning unavailable                   |
| Non-chrono QR scanned            | Ignored, scanning continues                          |
| `play` before `connect`          | Guarded; prompt "Connect player first"               |

## Testing strategy

- **Unit (Vitest):** token codec roundtrip + bad-input; `trackIdToUri`; PKCE
  challenge derivation (injected randomness) + expiry; playlist parsing from a
  fixture JSON (injected fetch); provider play/pause Web API calls (injected
  fetch); MockScanner.
- **E2E (Playwright):** harness with `?mock=1` (MockProvider + MockScanner).
  Asserts mock scan -> `play` called -> "Now playing" shown. Never touches real
  Spotify, camera, or Premium.
- **Manual (the real proof):** developer logs in with Premium on
  `http://127.0.0.1:5173`, connects, imports a playlist link, scans an on-screen
  QR, hears the track.

## Dependencies to add

- `@zxing/browser` (+ `@zxing/library`): camera QR decode
- `qrcode`: render seed/imported tracks as QR images
- `@types/spotify-web-playback-sdk` (dev): SDK typings
- The Web Playback SDK script loads at runtime via a tag, not npm.

## Configuration / accounts

- One Spotify developer app (already created): Client ID in `.env`
  (`VITE_SPOTIFY_CLIENT_ID`), redirect URI `http://127.0.0.1:5173/callback`
  (Spotify rejects `localhost`).
- Dev-mode allowlist: only emails added to the app can log in (max 25) until a
  quota-extension request moves it to production. The developer account is
  allowlisted by default.
- End users need only Premium + login + camera permission. They never create an
  app or paste a token.

## Dev target

Desktop browser at `http://127.0.0.1:5173` (a secure context, so `getUserMedia`
and the SDK both work). Phone testing needs an HTTPS tunnel and is deferred.

## Future (informs structure, not built now)

- Curated **template playlists** the user picks from.
- **Connect account -> browse your own playlists** via an in-app picker, instead
  of pasting a link.
- Real game engine, turns/scoring, identity-hidden reveal flow, and final UI
  (the rest of Phase 1).
- Release-year accuracy: manual override + MusicBrainz cross-check.

```

```
