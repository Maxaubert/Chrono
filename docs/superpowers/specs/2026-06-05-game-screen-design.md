# Game Play Screen — Design

**Status:** Approved (design), pending implementation plan
**Issue:** #9 (Slice 3c)
**Date:** 2026-06-05

## Goal

Replace the placeholder in-game screens (Turn / Reveal / Win) with a polished
play screen in the Ultra Violet HUD style established for the menu and setup. The
layout, cards, mystery card, overview, background, and animations were settled
through interactive mockups (`?gmock=1`). This spec captures those decisions and
the implementation approach.

## Visual source of truth

The approved look lives in the mockup route `?gmock=1`
(`src/ui/game/mock/`). Implementation should match it. The mock is throwaway and
gets removed once the real screen lands.

## Scope

**In:**

- The "listening" turn state: overview, mystery (now-playing) card, hand fan,
  tap-to-place interaction.
- The reveal state (after placing): show the song identity + correct/wrong.
- The win state.
- Background (dark + "sharp" glow visualizer).
- Fan spread/pile animation, used for turn-change and new-deck transitions.

**Out (future):**

- Web-Audio-reactive visualizer (decorative loop for now).
- Optional video background (kept as a local experiment only).
- History-game skinning of the screen (this slice is Hitster-only; layout stays
  game-agnostic where practical).

## Layout (the "listening" turn)

A full-viewport `.game-screen` with three zones over the background:

```
+----------------------------------------------------------+
| [overview]                                               |
|  Anna's turn                                             |
|  Anna  ====  5/10                                        |
|  Lizzy ==    2/10            (mystery card)              |
|  Ben   ===   3/10              [ ? ]                     |
|                              NOW PLAYING                 |
|                              ( replay )( pause )         |
|                                                          |
|            ~~~~~ glow visualizer (mid band) ~~~~~        |
|                                                          |
|                  (hand fan, 1-20 cards)                  |
|                [card][card][card][card]                  |
+----------------------------------------------------------+
```

- **Overview overlay** — compact floating panel, top-left. Beveled HUD frame
  (clip-path), translucent + blur. Shows the current player's name as
  "<NAME>'S TURN", then a row per player: name, progress bar (cards/target),
  count "n/target". The active player's row is full-opacity; others dimmed.
- **Mystery card** — centered, slightly above middle. Reuses the card frame with
  a "now playing / hidden" interior: spinning vinyl disc, glowing `?`, animated
  EQ bars, "NOW PLAYING" + "MYSTERY TRACK", and replay/pause controls below.
  A "tap a card below to place this" hint sits under it. This is the only card
  that keeps the prismatic sheen.
- **Hand fan** — the current player's timeline cards, real Hitster album cards
  (art + year), fanned along the bottom. See "Hand geometry".

## Hand geometry

- Cards spread horizontally (constant per-card gap) plus a gentle rotation and
  arc, so each card stays visible and tappable rather than packing into a tight
  angle.
- The whole hand auto-scales down once its span would exceed the usable width,
  so 1–20 cards always fit clear of the side panels. (Target ceiling is 20, the
  max win target.)
- Placement gaps: between/around each card is a tappable target. Tapping a gap
  (or its adjacent card edge) selects that slot. See "Placement".

## Background

- **Backdrop:** dark and sleek — near-black base with subtle cool radial glows
  (top + bottom), a soft focus glow behind the mystery card, and a vignette. No
  grid or horizon lines.
- **Visualizer ("sharp" glow):** a row of thin bars, merged via a small blur
  into a smooth glowing waveform (no visible discrete bars), mirrored around a
  center axis, sitting in the mid band so it stays clear of the hand. Colors:
  violet edge → cyan core. Decorative animation loop (per-bar varied
  speed/phase). Respects `prefers-reduced-motion`.
- Implemented as CSS variables so color/blur are easily themed later.

## Interactions & animations

- **Place a card:** tap a slot in the hand → the chosen position is confirmed →
  dispatch `place`. (Mock shows a lifted-card + BEFORE/AFTER affordance; the
  shipped interaction is tap-a-gap, with the lift as a visual flourish.)
- **Reveal:** after `place`, show the drawn song's title/subtitle/year and
  whether the placement was correct (kept) or wrong (discarded), with a Next
  button.
- **Turn change / new deck:** on Next, the outgoing hand collapses from the fan
  into a pile, then the next player's hand slides in as a pile and fans back out.
  Driven by the spread↔pile transition (toggle a `piled` class with a
  per-card staggered `transform` transition).
- **Win:** when a player reaches the target, show the win screen (winner +
  standings + play again).

## State mapping (engine → UI)

Reuses the existing pure engine and hook unchanged:

- `GameState` (`src/core`): `players[]` (each `{id,name,timeline:Card[]}`),
  `drawn` (`{card, reveal}`), `currentPlayerIndex`, `phase`
  (`'listening' | 'revealed'`), `status`, `config.targetCards`, `winnerId`,
  `lastOutcome`.
- `GameContainer` already orchestrates start/draw/play/advance and chooses
  Turn/Reveal/Win. This slice swaps the **presentational** components it renders;
  the orchestration and `useGame` reducer stay as-is.
- Overview data = `standings(state)` + `currentPlayer(state)` +
  `config.targetCards`. Hand = `currentPlayer(state).timeline`. Mystery controls
  call the existing `session.provider` pause/replay; gaps call
  `dispatch({type:'place', slotIndex})`.

## Component architecture

New presentational components under `src/ui/game/play/` (keep `GameContainer`
as the orchestrator):

- `GameScreen.tsx` — the listening-state layout: `<GameBackground/>`,
  `<Overview/>`, `<MysteryCard/>`, `<Hand/>`. Props are derived from
  `GameState` + callbacks (`onPlace`, `onPause`, `onReplay`).
- `Overview.tsx` — the scoreboard overlay.
- `MysteryCard.tsx` — the now-playing/hidden card + controls.
- `Hand.tsx` — the fan, including geometry, auto-scale, and gap targets.
- `GameBackground.tsx` — backdrop + glow visualizer.
- `RevealPanel.tsx` / `WinScreen.tsx` — restyled to match (replace the current
  plain versions).
- CSS colocated (`play.css` or per-component), in the HUD style.

`GameContainer` renders `GameScreen` when `phase==='listening'`, the reveal
overlay when `phase==='revealed'`, and the win screen when `isWon`.

## Card styling extraction (key refactor)

The card visuals (`.card`, album art, year, sheen) are currently scoped under
`.skin-hitster .menu-screen .card` in `src/games/hitster/skin.css`. The game
screen is not `.menu-screen`, so the card styling must be reusable outside it.

Plan: rescope the card rules from `.skin-hitster .menu-screen .card …` to a
shared selector (e.g. `.skin-hitster .h-card …`) and have both the menu fan and
the game hand render cards with that class. The menu keeps working (its cards
gain the new class); the game screen gets the same card look without depending on
`.menu-screen`. The "sheen only on the mystery card" rule becomes a default-off
sheen that the mystery card opts into.

This refactor is a discrete early task in the plan, with the existing menu E2E
(`menu.spec.ts`) guarding against visual regressions.

## Responsiveness & accessibility

- Hand auto-scales to fit; overview and tools reserve side margins so the fan
  clears them at high counts.
- `aria-hidden` on purely decorative layers (background, visualizer).
- All ambient animations (visualizer, sheen, vinyl, fan idle) honor
  `prefers-reduced-motion`.
- Mystery controls and gap targets are real buttons with accessible labels;
  keep the existing `data-testid`s (`gap-<i>`, `next`, `winner`, etc.) so E2E
  keeps passing.

## Testing

- Unit: hand geometry helper (span/scale, gap count for N cards) is pure and
  testable.
- E2E (`game.spec.ts`): the existing mock playthrough must keep passing
  (menu → setup → game → win). Update selectors only if markup changes; preserve
  `gap-<i>` / `next` / `winner` semantics.
- Verify loop per CLAUDE.md: lint + test + build + e2e.

## Open questions / future

- Web-Audio-reactive visualizer (drive bar heights from the actual track).
- Per-game theming of the background/visualizer (History game).
- Whether the lifted-card BEFORE/AFTER affordance fully replaces tap-a-gap or
  layers on top of it.
