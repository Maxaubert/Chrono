# Mobile-first UI — design

**Issue:** #60 · **Branch:** `feat/mobile-first-ui` · **Date:** 2026-06-23

## Goal

Make Chrono genuinely usable on phones (320–430px portrait) without changing the
desktop experience at all. The desktop play screen assumes a ~1180px width and
breaks on a phone. Per the user: **keep desktop as-is and build a dedicated mobile
version — do not just scale the desktop down.** No visual restyling (Ultra Violet
palette, fonts, card art stay identical).

## Core mechanism: a desktop/mobile fork

A single hook decides which layout renders:

```ts
// src/ui/useIsMobile.ts
useIsMobile(): boolean  // matchMedia('(max-width: 760px)'), updates on resize/rotate
```

- Desktop components are **never edited** beyond a single guard that returns the
  mobile component when `useIsMobile()` is true.
- The play screen gets its own component tree (genuinely different layout).
- Every other screen reflows via mobile-first CSS on existing markup (its DOM is
  already flexible enough).

## Shared foundation (built first, before fan-out)

1. `src/ui/useIsMobile.ts` — the switch hook.
2. `src/mobile.css` (imported once in `src/index.css`) — global mobile base:
   - `100dvh` for fullscreen layouts (avoids iOS Safari URL-bar jump).
   - Tap-target floor: interactive elements ≥44px on coarse pointers.
   - Hover effects gated behind `@media (hover: hover)` so touch taps don't get
     stuck in hover state. Touch gets `:active` feedback instead.
   - `touch-action`/`-webkit-tap-highlight-color` resets.

All mobile CSS is scoped under a mobile root class (e.g. `.mobile-game-screen`,
or a `body.is-mobile` flag) so it cannot leak onto desktop — CSS is bundled
globally in this project. (See memory: css-global-scope-gotcha.)

## Play screen — dedicated mobile layout

`GameScreen.tsx` branches at the top:

```tsx
if (useIsMobile()) return <MobileGameScreen {...props} />
// existing desktop JSX unchanged below
```

`MobileGameScreen` (new) is a vertical flex column over `GameBackground`:

- **Top:** `MobileOverview` — compact horizontal scoreboard strip (current
  player + per-player progress). Reuses Overview data, new compact markup.
- **Middle:** the **game-supplied `Mystery`** reused unchanged, dropped into a
  flow container. Mobile CSS overrides the desktop `position:absolute; top:38%`
  on mystery wrappers to `position:static` _within the mobile scope only_.
- **Bottom:** `MobileHand` — a **tap-to-place rail**. The player's timeline is a
  horizontally-scrollable row of their cards. Between every pair of cards (and
  before the first / after the last) sits a large `+` placement gap. A timeline
  of N cards has N+1 gaps; gap `k` calls the existing `onPlace(k)` — identical
  contract to the desktop Hand, so the engine is untouched. Honors `piled` /
  `interactive` the same way (no placement while a turn is ending/switching).

The desktop `Hand`, `Overview`, fan geometry, and their CSS are not modified.

## Full mobile-first pass (CSS + minor markup) — parallel work

| Area              | Files                                                                                                    | Changes                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Menu + GamePicker | `menu/*`                                                                                                 | single-column, full-width buttons, fan adapted for narrow width, touch states |
| Setup wizards     | `game/SetupScreen` + `setup.css`, history + static setup                                                 | single-column steps, thumb-friendly inputs/sliders, sticky nav, ≥44px targets |
| Overlays          | `play/RevealOverlay`+`reveal.css`, `TurnSwitch`+`turn-switch.css`, `WinScreen`+`win.css`, `transition/*` | `dvh` sizing, fit 320–430px, touch states                                     |

## Execution

1. Foundation (hook + `mobile.css`) — built and build-verified first.
2. Four subagents in parallel, disjoint file sets (no edit conflicts):
   - A: Menu/GamePicker · B: Setup wizards · C: Play-screen mobile components ·
     D: Overlays.
3. Verify: `lint` + `test` + `build`, Playwright screenshots at 375px per screen.
4. PR referencing #60 → merge to `main` (Vercel auto-deploys for final testing).

## Non-goals / guardrails

- No color, font, or card-art changes.
- Desktop render output unaffected (fork is behind the hook).
- Reversible: removing the hook branch + `mobile.css` import restores prior state.
