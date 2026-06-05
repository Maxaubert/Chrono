# Phase 2 (Option B): in-page iTunes clip guest audio — Plan

> Issue #27. Spec: docs/superpowers/specs/2026-06-05-equivalent-player-design.md (Option B).
> CORS + previewUrl confirmed via a headless spike. Executed inline, TDD.

**Goal:** Guest mode plays a 30s iTunes preview in our own page (title hidden,
no login, any device); replaces the QR handoff.

---

### Task 1: Extend `AudioTrackRef`

- `src/audio/types.ts`: add optional `artist?: string; title?: string` (search hints;
  the Spotify/Mock providers ignore them).

### Task 2: `ItunesPreviewProvider` (TDD)

- `src/audio/itunes.ts`: `implements AudioProvider`, `id='itunes'`. Holds an
  `HTMLAudioElement` (injectable for tests) + injectable `fetchImpl`.
  - `play(track)`: build `term = artist + ' ' + title`; GET
    `https://itunes.apple.com/search?term=<term>&entity=song&limit=1`; play
    `results[0].previewUrl` in the element from `currentTime=0`. No term / no match /
    fetch error / `audio.play()` rejection -> stay silent, never throw.
  - `pause`/`resume`/`stop`: control the element.
- `src/audio/itunes.test.ts`: play searches by artist+title and sets src + plays;
  no match -> silent (play not called); fetch rejection -> silent; pause/stop call
  the element. Inject a fake audio + fake fetch (jsdom can't `HTMLMediaElement.play`).
- `src/audio/index.ts`: export `ItunesPreviewProvider`.

### Task 3: Guest uses the iTunes provider

- `src/ui/game/useSpotifySession.ts`: guest provider -> `new ItunesPreviewProvider()`.
- Delete `src/audio/guest.ts` + `src/audio/guest.test.ts` (GuestProvider superseded);
  drop its export from `src/audio/index.ts`.

### Task 4: Pass search hints; drop QR threading

- `src/ui/game/GameContainer.tsx`: `play(cardId)` builds
  `{ uri: 'spotify:track:'+cardId, artist: artistOf(cardId), title: titleOf(cardId) }`;
  callers pass the card id. Remove `qr={session.guest}` from `<GameScreen>`.

### Task 5: Remove the QR mystery card (Option B hides the title in-page instead)

- `src/ui/game/play/MysteryCard.tsx`: remove `qr`/`trackId` props, `QrMystery`, the QR
  imports/state. Back to the "?" card + replay/pause/play.
- `src/ui/game/play/MysteryCard.test.tsx`: remove the QR test.
- `src/ui/game/play/GameScreen.tsx`: remove the `qr` prop + `trackId` pass-through.
- `src/scan/token.ts` + `token.test.ts` + `scan/index.ts`: remove `trackIdToOpenUrl`
  (only the mystery card used it; `renderQrDataUrl` stays for the spike harness).
- `src/ui/game/play/mystery-card.css`: drop the `.myst-qr*` rules.

### Task 6: E2E (headless)

- `e2e/guest.spec.ts`: stub iTunes (`page.route('**itunes.apple.com**', ...{results:[]})`)
  for determinism; assert guest mode shows the play/pause controls and **no** QR image,
  and plays to a win.

### Final

- `lint` + `test` + `build` + `test:e2e` green; PR -> main, Closes #27.
