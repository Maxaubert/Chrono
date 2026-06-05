# Guest Mode (paste a playlist + QR playback) — Design

**Issue:** #21
**Date:** 2026-06-05

## Goal

Let anyone host a Hitster game and share it with friends without logging into our
Spotify app, without Premium-in-browser, and without the 25-user dev-mode
allowlist. The host pastes a public Spotify playlist URL; during play, the
"now playing" card shows a **QR code** that a player scans with their own native
Spotify app, which plays the full song on their device.

## Background / why this works

- Reading a public playlist's tracks already happens **anonymously**, server-side,
  via the existing scrape endpoints (`/api/playlist-tracks`, `/api/track-year`).
  No user login is involved. `useSpotifySession.importPlaylistId` / `fetchYear`
  already call these and do not require `loggedIn`.
- Playback is the only thing that needed Premium + login (Web Playback SDK).
  Moving it to a **QR deep link** (`https://open.spotify.com/track/<id>`) hands
  playback to each player's own Spotify app, so our app never authenticates anyone
  for playback. The SDK, the `streaming` scope, and the playback allowlist drop out.

The audio layer already anticipates this: `src/audio/types.ts` notes "later phases
add ... a QR/hosted player," and `src/scan/` already ships `renderQrDataUrl` and
`trackIdToUri`.

## Design

### Mode

A third session mode alongside the existing real-Spotify and `?mock=1` paths:
`guest`. Guest mode is entered from the setup login gate via a secondary
**"Play as guest"** action (not a URL flag), so a normal visitor can choose it.

When `guest` is active:

- no Spotify login / device connect;
- `provider` is a no-op `GuestProvider` (nothing streams in-app);
- `importPlaylistId` / `fetchYear` are reused **unchanged** (anonymous scrape);
- the mystery card renders a QR instead of play/pause controls.

### Components

1. **`src/audio/guest.ts` — `GuestProvider implements AudioProvider`**
   `id: 'guest'`; `play/pause/resume/stop` are no-ops. Keeps every existing
   `session.provider.play(...)` call site unchanged (they simply do nothing in
   guest mode), so GameContainer needs no playback branching.

2. **`src/scan/token.ts` — track deep-link helper**
   Add/confirm a `trackIdToOpenUrl(id)` returning
   `https://open.spotify.com/track/<id>` (universal link: opens the Spotify app on
   mobile, web player on desktop). If `trackIdToUri` already covers a usable form,
   extend rather than duplicate.

3. **`useSpotifySession(guest: boolean)`**
   Accept a `guest` flag (parallel to the existing `mock`). The `provider` useMemo
   becomes `mock -> Mock : guest -> Guest : Spotify`. Expose `guest` on the session.
   Auto-connect and the OAuth callback effect are skipped when `guest`.

4. **`GameRoot` (App.tsx)**
   Hold `const [guest, setGuest] = useState(false)`, pass `guest` into
   `useSpotifySession(guest)`, and pass `setGuest` to `SetupScreen` so the gate can
   enter guest mode.

5. **`SetupScreen` — guest entry + guest playlist step**
   - Gate: under "LOG IN WITH SPOTIFY", add a secondary **"Play as guest — paste a
     playlist"** button that calls `onGuest()` (sets guest mode), dismissing the gate.
   - Playlist step: in guest mode, hide the "Your Playlists" list (needs login) and
     show only the **paste-a-link** import — the same branch already used for
     `session.mock`. Reuse the existing `session.mock ?` conditionals by switching
     them to `session.mock || session.guest` where they mean "no my-playlists".
   - Readiness: `needLogin` becomes `!mock && !guest && !loggedIn`; the START gate
     drops the `connected`/`loggedIn` requirement when `guest` (only needs names +
     at least one imported track).

6. **`GameScreen` / `MysteryCard` — QR variant**
   `GameScreen` passes the current track id (`state.drawn.card.id`) and a `qr`
   boolean (true in guest mode) to `MysteryCard`. When `qr` is set, `MysteryCard`
   renders the QR image (from `renderQrDataUrl(trackIdToOpenUrl(id))`) plus a
   "SCAN TO PLAY" label and a small "opens in your Spotify app" hint, **instead of**
   the spinning disc / equalizer / play-pause / replay controls. No transport
   controls exist in guest mode (playback is external). The "?" mystery framing and
   the hidden year are unchanged.

### Data flow

```
Gate -> "Play as guest" -> setGuest(true)
Players step (names, target)               [unchanged]
Playlist step -> paste public URL -> importPlaylistId (scrape) -> tracks
Review -> START -> deck built
Game: mystery card renders QR of current track's open.spotify.com link
      player scans -> song plays in their Spotify app
      place card -> reveal year (unchanged) -> next turn
provider.play/pause/etc. -> no-ops (GuestProvider)
```

### Error handling

- Playlist scrape / empty / invalid URL: surfaced by the **existing** setup error
  banner (`importPlaylistId` already throws and is caught).
- `renderQrDataUrl` failure: fall back to showing the raw track link as selectable
  text so the host can still open/share it.
- A drawn track with no id (should not happen): mystery card shows the "?" with the
  "scan to play" hint omitted rather than a broken QR.

### Testing

- **Unit**
  - `GuestProvider`: `play/pause/resume/stop` resolve and do nothing; `id === 'guest'`.
  - `trackIdToOpenUrl`: builds the expected `open.spotify.com/track/<id>` URL.
  - `MysteryCard` (qr mode): renders an `<img>` (the QR) and a "SCAN TO PLAY"
    label, and renders **no** play/pause/replay buttons.
  - `SetupScreen` guest path: clicking "Play as guest" dismisses the gate; the
    playlist step shows the paste-link input and no "Your Playlists" list; START is
    enabled with names + an imported (mock) track and no login.
- **E2E** (`?mock=1` + guest): enter guest mode, paste the mock link, play a short
  game; assert the mystery card shows a QR image (not a play button) and the game
  reaches a win. (Mock `importPlaylistId` returns the fixed deck, so no network.)

## Trade-offs (accepted, documented)

- Reading **any** public playlist still uses the off-ToS anonymous scrape.
- A raw Spotify QR shows the song/album in the scanner's Spotify app (minor answer
  peek). The strict fix (a no-metadata hosted player) is out of scope.
- Reliable on-demand mobile playback needs the **scanner's own** Spotify Premium
  (their account, not ours); Spotify free on mobile may shuffle instead of playing
  the exact track. Documented in the guest UI copy.

## Out of scope (future, separate work)

- **iTunes 30-sec preview provider** — the fully-clean, fully-open alternative
  (no Spotify at all). Worth building later as a second guest audio source; the
  `AudioProvider` seam makes it drop-in.
- **No-metadata hosted player** — to fully prevent the answer peek.
- **Vercel deployment** — guest mode still depends on `/api/playlist-tracks` and
  `/api/track-year`, which today exist only in the Vite dev server. To deploy and
  actually share, those endpoints must be ported to serverless functions (separate
  hosting task). Guest mode runs fully under `npm run dev` now.

## Note on the engine epic (#17)

This adds another playback variant to a play screen the audit flagged as
Spotify-coupled. Guest mode is implemented pragmatically within the current
structure (a `qr` flag + a no-op provider) to unblock sharing; it does not wait on
the #17 GameEngine/TurnPresenter refactor, and the QR/preview cases become clean
presenter implementations once #17 lands.
