# History game — design

Status: approved (design), pending spec review
Date: 2026-06-05

## Goal

Make the **History** game playable. Mechanically it behaves exactly like Hitster
(the existing single-device, pass-and-play timeline loop); it differs only in
**styling** and in showing a **text clue** instead of playing a song. History is
the second game on the shared engine and proves the pluggable-game abstraction
(roadmap Phase 2).

The 100-card deck art and data already exist:
- `src/games/history/deck.json` — 100 cards (`slug`, numeric `year`, `yearLabel`,
  `title`, `era`, `place`, `description` [the clue, year-free], `image`).
- `public/history/<slug>.jpg` — the 100 oil-painting card images.

## Turn mechanic (decided)

On a History turn the mystery card shows **only the clue** (the card's
`description`, e.g. "Nazi Germany invades Poland, starting World War II."). The
player places it on the timeline by year. The reveal then flips to the
**painting + title + year**. This is the direct analog of Hitster's "hear the
song, then reveal the cover."

## Current architecture (what we build on)

- `src/core/` is **already framework-agnostic and game-neutral**. `DrawnCard`
  carries `{ card: {id, year}, reveal: {title, subtitle?, year} }`. No core
  changes are needed.
- `src/ui/game/play/RevealOverlay.tsx` already reads `reveal` from state and
  takes the image as a prop — reusable for History almost verbatim.
- The Hitster-specific surface is narrow and lives in:
  - `GameContainer.tsx` — Spotify deck building + audio playback + track info.
  - `play/MysteryCard.tsx` — the audio play/pause (or QR) control.
  - `SetupScreen.tsx` — the Spotify login + playlist wizard.
- `Hand`, `Overview`, `TurnSwitch`, `useGame`, and the turn choreography are
  already generic.

## Design

### 1. The game-play adapter

Extend `GameModule` (`src/games/types.ts`) with an optional `play` adapter. A game
becomes playable by supplying it. Shape (names indicative):

```ts
interface GamePlay {
  // init(setup, rng) -> handle; next(handle) -> Promise<DrawnCard | null>
  // Incremental draw so Hitster can keep lazily fetching/skipping years.
  DeckSource: DeckSource
  // React component rendered in the mystery slot for the current drawn card.
  Mystery: ComponentType<MysteryProps>
  // Image shown on the reveal; RevealOverlay renders title/subtitle/year.
  revealImage?(drawn: DrawnCard): string | undefined
  // Playback hooks; omitted entirely = silent game (History).
  audio?: { onDraw, onPause, onResume, onReplay, onStop }
  // Collects names + win target (+ any game payload) -> onStart(setup).
  Setup: ComponentType<SetupProps>
}
```

`GameContainer` becomes **adapter-driven**: it keeps the full turn choreography
(draw → place → reveal → pile → turn-switch → deal → win) unchanged, but sources
draws from `play.DeckSource.next()`, renders `play.Mystery`, fires
`play.audio?.onDraw` per draw (no-op when absent), and passes
`play.revealImage(drawn)` to `RevealOverlay`. Hitster becomes the first
implementer of the adapter; its behavior is unchanged.

### 2. History implementation

- **DeckSource** — imports `deck.json`, maps each card to a `DrawnCard`
  (`id: slug`, `year`, `reveal: { title, subtitle: era, year }`, image
  `/history/<slug>.jpg`), shuffles with the injected rng, and pops sequentially.
  Years are known, so no async fetch. Anchors and draws all pull from the 100.
- **Mystery card** — a `skin-history` card showing the clue text only, with a
  "place this on your timeline" hint. No painting shown pre-reveal.
- **Reveal** — reuse `RevealOverlay` with the painting as the image; add a
  `skin-history` reveal style so the overlay matches the game's theme.
- **Audio** — omitted.
- **Setup** — a minimal players + win-target screen (no Spotify). The existing
  players/target form is extracted into a shared component both games reuse.
- **Wiring** — `history/index.ts` gains `play` and `playable: true`; the menu
  PLAY routes to the generic container with the active game's adapter (replacing
  the current hard-coded Spotify SetupScreen path in `App.tsx`).

### 3. Delivery — two PRs

1. **PR 1 — Generalize the loop (pure refactor).** Introduce the adapter and make
   Hitster implement it. **No behavior change; all existing unit + E2E tests stay
   green.** De-risks the abstraction on the working game before adding a new one.
2. **PR 2 — Add History.** History's adapter (deck loader + shuffle, clue mystery,
   painting reveal, `skin-history` styles, minimal setup), `playable: true`, and
   menu wiring. New unit tests + a Playwright playthrough.

Each PR is its own GitHub issue and branch, landed via PR.

## Testing

- `src/core/` is untouched; its tests stay green.
- TDD the new pure logic: the History deck loader and deterministic shuffle
  (injected rng), and any adapter-shaped helpers.
- PR 1: the full existing Hitster suite (unit + Playwright) must stay green —
  that is the refactor's safety net.
- PR 2: unit tests for the History DeckSource; a Playwright E2E that runs a real
  History game (setup → place a few cards → reveal → win). No Spotify/mock needed.

## Non-goals (YAGNI for now)

- No era/difficulty filtering or deck subsets — shuffle all 100.
- No online multiplayer (Phase 4).
- No audio for History.
- No changes to Hitster's gameplay, only its internal wiring (PR 1).

## Open / deferred

- Exact `skin-history` styling for the in-play mystery card and reveal is a
  visual pass during PR 2 (we will iterate on look, as flagged "tweak later").
- Whether Hitster's Setup wizard fully adopts the shared players/target component
  or just shares the extracted form is an implementation detail for PR 1.
