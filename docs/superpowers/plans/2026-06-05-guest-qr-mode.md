# Guest Mode (paste playlist + QR playback) — Implementation Plan

> Executed inline (tasks are tightly coupled: session/provider/setup/game-screen).
> TDD where it fits. Frequent commits. Spec: docs/superpowers/specs/2026-06-05-guest-qr-mode-design.md

**Goal:** A no-login "guest" mode where the host pastes a public playlist and the
mystery card shows a QR players scan with their own Spotify app.

**Tech:** React 19 + Vite + TS, Vitest, Playwright. Reuse `src/scan/renderQrDataUrl`
and the anonymous scrape already behind `useSpotifySession.importPlaylistId`.

---

### Task 1: `trackIdToOpenUrl` deep-link helper (TDD)

- Test `src/scan/token.test.ts`: `trackIdToOpenUrl('abc')` === `https://open.spotify.com/track/abc`.
- `src/scan/token.ts`: add the function. `src/scan/index.ts`: export it.
- Commit.

### Task 2: `GuestProvider` no-op AudioProvider (TDD)

- Test `src/audio/guest.test.ts`: `id === 'guest'`; `play/pause/resume/stop` resolve, no throw.
- `src/audio/guest.ts`: `GuestProvider implements AudioProvider` (all no-ops).
- `src/audio/index.ts`: export `GuestProvider`.
- Commit.

### Task 3: `useSpotifySession(guest)` mode

- `src/ui/game/useSpotifySession.ts`:
  - read `?guest=1` OR accept a `guest` arg; signature `useSpotifySession(guestArg = false)`,
    `const guest = guestArg || urlParam('guest')`.
  - provider memo -> `guest ? new GuestProvider() : mock ? new MockProvider() : new SpotifyProvider(...)`
    (guest wins so `?guest=1&mock=1` gives QR playback + mock tracks for E2E).
  - `importPlaylistId` / `fetchYear`: unchanged (mock -> MOCK, else scrape). Guest uses scrape.
  - skip OAuth callback effect and auto-connect when `guest`.
  - expose `guest` on the returned session; `loggedIn`/`connected` may stay false.
- Commit (with App + SetupScreen below, since types interlock).

### Task 4: `GameRoot` guest state (App.tsx)

- `const [guest, setGuest] = useState(() => urlParam('guest'))`; `useSpotifySession(guest)`.
- Pass `onGuest={() => setGuest(true)}` to `SetupScreen`.

### Task 5: SetupScreen guest entry + guest playlist UI

- Prop `onGuest?: () => void`.
- `needLogin = !session.mock && !session.guest && !session.loggedIn`.
- Gate: under the Spotify login button, a secondary "Play as guest -- paste a playlist"
  button calling `onGuest`.
- Playlist step: switch the `!session.mock` conditionals that hide "Your Playlists"
  to `!session.mock && !session.guest` (guest has no my-playlists; paste-link only).
- Readiness: `ready = (session.guest || (session.loggedIn && session.connected)) &&
combined.length > 0 && namesReady`.
- Test `src/ui/App.test.tsx` (or SetupScreen test): with `?guest=1&mock=1`, no login gate;
  setup reaches START and the paste/import is shown without a "Your Playlists" list.

### Task 6: MysteryCard QR variant + GameScreen wiring (TDD)

- `MysteryCard` props: add `qr?: boolean` and `trackId?: string`.
  - When `qr`: render the QR `<img>` (from `renderQrDataUrl(trackIdToOpenUrl(trackId))`,
    resolved in an effect into state) + "SCAN TO PLAY" label + "opens in your Spotify app"
    hint. Render NO disc/equalizer/play-pause/replay. Fallback to the raw link text if
    QR render rejects.
  - Else: existing behavior unchanged.
- `mystery-card.css`: `.game-screen .myst-qr` styles (image box + label), reduced-motion safe.
- `GameScreen` props: add `qr?: boolean`; pass `qr` and `trackId={state.drawn?.card.id}`
  to `MysteryCard`.
- Test `src/ui/game/play/MysteryCard.test.tsx`: qr mode renders an `<img>` + "SCAN TO PLAY"
  and no play/pause/replay buttons.
- Commit.

### Task 7: GameContainer wiring

- Pass `qr={session.guest}` to `GameScreen` (provider is already the no-op GuestProvider,
  so `play/pause/resume` calls are harmless no-ops; no other branching needed).
- Commit Tasks 3-7 together (they share the `guest` type surface).

### Task 8: E2E guest flow

- `e2e/guest.spec.ts`: load `?guest=1&mock=1`, run setup (names + paste any link -> mock
  deck), START; assert the mystery card shows a QR `<img>` (not a play button) and the
  game plays to a win (mirror `e2e/game.spec.ts`).
- Commit.

### Final: verify + PR

- `npm run lint` + `npm run test` + `npm run build` + `npm run test:e2e` all green.
- Open PR -> main, "Closes #21". Note the Vercel-endpoint dependency for deploy.
