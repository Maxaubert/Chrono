# Game Play Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Turn/Reveal/Win screens with the polished HUD-style play screen designed in `?gmock=1` (overview overlay, mystery card, wide auto-scaling hand fan, dark "sharp" glow background), reusing the existing pure engine.

**Architecture:** New presentational components in `src/ui/game/play/`; `GameContainer` stays the orchestrator and keeps the `useGame` reducer + engine unchanged. The Hitster card visual is rescoped from `.menu-screen .card` to a shared `.h-card` so it works off the menu. Hand geometry and card gradients are pure, unit-tested helpers; the rest is verified by the existing mock-game E2E.

**Tech Stack:** React 19 + TypeScript, Vitest + Testing Library (jsdom), Playwright, CSS (HUD style, CSS variables).

**Visual source of truth:** the mock at `src/ui/game/mock/` (`?gmock=1`). Port from it; it is removed in the final task.

**Spec:** `docs/superpowers/specs/2026-06-05-game-screen-design.md`

---

## File Structure

- `src/games/hitster/HitsterCard.tsx` — card root class `card`→`h-card` (modify)
- `src/games/history/HistoryCard.tsx` — card root class `card`→`h-card` (modify)
- `src/games/hitster/skin.css` — rescope card look/internals to `.h-card`; keep sheen menu-scoped (modify)
- `src/games/history/skin.css` — rename `.card`→`.h-card` in card selectors (modify)
- `src/ui/menu/menu-base.css` — move `.menu-screen .card` frame to shared `.h-card` (modify)
- `src/ui/game/play/handGeometry.ts` (+ `.test.ts`) — pure fan layout for N cards (create)
- `src/ui/game/play/cardArt.ts` (+ `.test.ts`) — deterministic gradient from a card id (create)
- `src/ui/game/play/GameBackground.tsx` + `game-background.css` — backdrop + glow visualizer (create)
- `src/ui/game/play/Overview.tsx` + `overview.css` — scoreboard overlay (create)
- `src/ui/game/play/MysteryCard.tsx` + `mystery-card.css` — now-playing/hidden card (create)
- `src/ui/game/play/HandCard.tsx` + `hand.css` — a single year card (create)
- `src/ui/game/play/Hand.tsx` — the fan + gap targets (create, shares `hand.css`)
- `src/ui/game/play/GameScreen.tsx` + `game-screen.css` — compose the listening state (create)
- `src/ui/game/play/RevealOverlay.tsx` + `reveal.css` — restyled reveal (create; replaces `RevealPanel.tsx`)
- `src/ui/game/play/WinScreen.tsx` + `win.css` — restyled win (create; replaces `src/ui/game/WinScreen.tsx`)
- `src/ui/game/GameContainer.tsx` — render the new components; thread a track-info lookup (modify)
- `src/ui/App.tsx` — remove `?gmock=1` route (modify, final task)
- delete `src/ui/game/mock/`, `src/ui/game/wireframe/`, `src/ui/game/TurnScreen.tsx`, `src/ui/game/RevealPanel.tsx`, `src/ui/game/WinScreen.tsx` (final task)

**Engine note:** the engine `Card` is `{ id, year }` (see `src/core/types.ts`). Placed timeline cards therefore know only the **year**. Album images per track are not available (`SpotifyTrack` is `{ id, uri, title, artist, year }`, no image). So hand cards show the **year** prominently plus **title/artist when known**, over a deterministic gradient derived from the id. `GameContainer` builds the deck from `setup.tracks`, so it threads a `Map<id, {title, artist}>` lookup down to the hand.

---

## Task 1: Extract the card visual to a reusable `.h-card`

**Why:** card styling lives under `.skin-<game> .menu-screen .card` + `.menu-screen .card` (frame). The game screen is not `.menu-screen`. Rescope to `.h-card` so cards render anywhere; keep the menu's drifting sheen menu-scoped so game hand cards don't shimmer.

**Files:**

- Modify: `src/games/hitster/HitsterCard.tsx:27`
- Modify: `src/games/history/HistoryCard.tsx:12`
- Modify: `src/ui/menu/menu-base.css:79-88`
- Modify: `src/games/hitster/skin.css` (card blocks)
- Modify: `src/games/history/skin.css` (card blocks)
- Guarded by: `e2e/menu.spec.ts` (Hitster + History card previews)

- [ ] **Step 1: Move the card frame to `.h-card`**

In `src/ui/menu/menu-base.css`, replace the block:

```css
/* outer card frame; internals are game-specific (in each skin) */
.menu-screen .card {
  position: relative;
  width: 240px;
  height: 344px;
  border-radius: 16px;
  overflow: hidden;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
```

with:

```css
/* outer card frame, reusable on any screen; internals come from each game skin */
.h-card {
  position: relative;
  width: 240px;
  height: 344px;
  border-radius: 16px;
  overflow: hidden;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 2: Rename the card class in both FanCards**

`src/games/hitster/HitsterCard.tsx:27`: change `<div className="card front">` to `<div className="h-card front">`.
`src/games/history/HistoryCard.tsx:12`: change `<div className="card front hist">` to `<div className="h-card front hist">`.

- [ ] **Step 3: Rescope the Hitster card look + internals (drop `.menu-screen`), keep sheen menu-scoped**

In `src/games/hitster/skin.css`:

- Look: `.skin-hitster .menu-screen .card {` → `.skin-hitster .h-card {`
- Internals (drop `.menu-screen`): `.skin-hitster .menu-screen .idx` → `.skin-hitster .h-card .idx`; same for `.idx i`, `.idx.tl`, `.idx.br`; `.skin-hitster .menu-screen .front .art` → `.skin-hitster .h-card .art`; `.art-disc`, `.art-sheen`, `.art-bars`, `.art-bars i` likewise → `.skin-hitster .h-card .art-*`; `.info`, `.title`, `.artist`, `.brand` → `.skin-hitster .h-card .*`.
- Sheen (KEEP `.menu-screen` so only menu cards shimmer): `.skin-hitster .menu-screen .card::before` → `.skin-hitster .menu-screen .h-card::before`; `::after` likewise; the reduced-motion block `.skin-hitster .menu-screen .card::before, .skin-hitster .menu-screen .card::after` → `.h-card` forms; the `.c1..c4 .card::before/::after` delay rules → `.skin-hitster .menu-screen .c1 .h-card::before` etc.

- [ ] **Step 4: Rename History card selectors (keep menu-scoped — History only shows in the menu)**

In `src/games/history/skin.css`, rename `.card` → `.h-card` in: `.skin-history .menu-screen .card` (look), `.skin-history .menu-screen .card::before`, the four `.skin-history .menu-screen .cN .card::before` rules, and the reduced-motion `.skin-history .menu-screen .card::before`. Leave `.hist-*` internals unchanged (they stay menu-scoped).

- [ ] **Step 5: Run the menu E2E to verify both card previews still render**

Run: `npm run test:e2e -- menu.spec.ts`
Expected: PASS (menu opens on Hitster; Choose Game swaps to History).

- [ ] **Step 6: Verify build + unit tests**

Run: `npm run build && npm run test`
Expected: typecheck clean; all unit tests pass (88).

- [ ] **Step 7: Commit**

```bash
git add src/games/hitster src/games/history src/ui/menu/menu-base.css
git commit -m "refactor(card): rescope card visual to reusable .h-card (#9)"
```

---

## Task 2: Hand geometry helper (pure, TDD)

**Files:**

- Create: `src/ui/game/play/handGeometry.ts`
- Test: `src/ui/game/play/handGeometry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/game/play/handGeometry.test.ts
import { expect, test } from 'vitest'
import { handLayout } from './handGeometry'

test('a single card is centred at full scale', () => {
  const { scale, cards } = handLayout(1)
  expect(scale).toBe(0.6)
  expect(cards).toEqual([{ rot: 0, tx: 0, ty: 0 }])
})

test('the fan is symmetric around the centre', () => {
  const { cards } = handLayout(5)
  expect(cards[0].tx).toBeCloseTo(-cards[4].tx)
  expect(cards[0].rot).toBeCloseTo(-cards[4].rot)
  expect(cards[2].tx).toBe(0)
})

test('a full 20-card hand scales down to fit the usable width', () => {
  const { scale } = handLayout(20)
  expect(scale).toBeLessThan(0.6)
  const span = (20 - 1) * 112 + 240
  expect(scale).toBeCloseTo(1180 / span)
})

test('count <= 0 yields no cards', () => {
  expect(handLayout(0).cards).toEqual([])
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test -- handGeometry`
Expected: FAIL ("Failed to resolve import './handGeometry'").

- [ ] **Step 3: Implement**

```ts
// src/ui/game/play/handGeometry.ts
export interface CardTransform {
  /** degrees */
  rot: number
  /** px (unscaled) */
  tx: number
  /** px (unscaled) */
  ty: number
}
export interface HandLayout {
  scale: number
  cards: CardTransform[]
}

const GAP_X = 112 // horizontal spacing between cards (unscaled px)
const CARD_W = 240 // matches .h-card width
const MAX_SCALE = 0.6
const USABLE_W = 1180 // px the hand may occupy before it must shrink

/** Fan transforms for a hand of `count` cards. Spreads horizontally (so each
 *  card stays tappable), tilts gently, arcs the outer cards down, and scales the
 *  whole hand down once it would exceed the usable width. */
export function handLayout(count: number): HandLayout {
  if (count <= 0) return { scale: MAX_SCALE, cards: [] }
  const mid = (count - 1) / 2
  const rotStep = Math.min(4, 26 / Math.max(1, count - 1))
  const span = (count - 1) * GAP_X + CARD_W
  const scale = Math.min(MAX_SCALE, USABLE_W / span)
  const cards = Array.from({ length: count }, (_, i) => {
    const off = i - mid
    return { rot: off * rotStep, tx: off * GAP_X, ty: Math.abs(off) * 7 }
  })
  return { scale, cards }
}
```

- [ ] **Step 4: Run the tests**

Run: `npm run test -- handGeometry`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/game/play/handGeometry.ts src/ui/game/play/handGeometry.test.ts
git commit -m "feat(play): pure hand fan geometry helper (#9)"
```

---

## Task 3: Deterministic card gradient helper (pure, TDD)

**Why:** placed cards have no album image; give each a stable colour from its id.

**Files:**

- Create: `src/ui/game/play/cardArt.ts`
- Test: `src/ui/game/play/cardArt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/game/play/cardArt.test.ts
import { expect, test } from 'vitest'
import { cardGradient } from './cardArt'

test('same id always yields the same gradient', () => {
  expect(cardGradient('abc')).toBe(cardGradient('abc'))
})

test('different ids generally differ', () => {
  expect(cardGradient('abc')).not.toBe(cardGradient('xyz'))
})

test('returns a CSS linear-gradient string', () => {
  expect(cardGradient('abc')).toMatch(/^linear-gradient\(150deg, hsl\(/)
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test -- cardArt`
Expected: FAIL ("Failed to resolve import './cardArt'").

- [ ] **Step 3: Implement**

```ts
// src/ui/game/play/cardArt.ts
/** Stable 32-bit hash of a string (FNV-1a). */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** A deterministic two-stop gradient for a card, derived from its id. */
export function cardGradient(id: string): string {
  const h = hash(id)
  const hue = h % 360
  const hue2 = (hue + 40) % 360
  return `linear-gradient(150deg, hsl(${hue} 70% 58%), hsl(${hue2} 65% 42%))`
}
```

- [ ] **Step 4: Run the tests**

Run: `npm run test -- cardArt`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/game/play/cardArt.ts src/ui/game/play/cardArt.test.ts
git commit -m "feat(play): deterministic card gradient from id (#9)"
```

---

## Task 4: Game background (dark backdrop + "sharp" glow visualizer)

**Files:**

- Create: `src/ui/game/play/GameBackground.tsx`
- Create: `src/ui/game/play/game-background.css`

- [ ] **Step 1: Implement the component**

```tsx
// src/ui/game/play/GameBackground.tsx
import { type CSSProperties } from 'react'
import './game-background.css'

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 4.137) * 43758.5453
  return x - Math.floor(x)
}
type Bar = { i: number; lo: number; hi: number; dur: number; delay: number }
const makeBars = (n: number): Bar[] =>
  Array.from({ length: n }, (_, i) => {
    const env = 0.6 + 0.4 * Math.sin((Math.PI * i) / (n - 1))
    return {
      i,
      lo: 0.08 + rnd(i, 2) * 0.12,
      hi: Math.min(1, (0.42 + rnd(i, 1) * 0.58) * env),
      dur: 0.7 + rnd(i, 3) * 0.95,
      delay: -rnd(i, 4) * 2,
    }
  })
const EQ_FRONT = makeBars(70)
const EQ_BACK = makeBars(34)

function eqBar(b: Bar) {
  return (
    <span
      key={b.i}
      className="bg-eq-bar"
      style={
        {
          '--lo': b.lo,
          '--hi': b.hi,
          animationDuration: `${b.dur.toFixed(2)}s`,
          animationDelay: `${b.delay.toFixed(2)}s`,
        } as CSSProperties
      }
    />
  )
}

/** Dark, sleek backdrop with a soft glowing "sharp" audio waveform (merged
 *  blurred bars), centred in the mid band, clear of the deck. Decorative. */
export default function GameBackground() {
  return (
    <div className="game-bg" aria-hidden="true">
      <div className="game-bg-glow" />
      <div className="bg-eq-wrap">
        <div className="bg-eq bg-eq-back">{EQ_BACK.map(eqBar)}</div>
        <div className="bg-eq bg-eq-front">{EQ_FRONT.map(eqBar)}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add the CSS (port the "sharp" variant from the mock)**

Create `src/ui/game/play/game-background.css` by porting the dark backdrop + glow visualizer from `src/ui/game/mock/game-bg.css`, baking in the `sharp` variant values (blur 3px / 9px) and renaming classes: `gm-bg`→`game-bg`, `gm-bg-dark`→(merge into `game-bg`), `gm-glow`→`game-bg-glow`, `gm-eq-wrap`→`bg-eq-wrap`, `gm-eq`→`bg-eq`, `gm-eq-bar`→`bg-eq-bar`, `gm-eq-front`→`bg-eq-front`, `gm-eq-back`→`bg-eq-back`. Full content:

```css
/* Dark, sleek game backdrop with a soft "sharp" glow waveform. Decorative. */
.game-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  --eq-edge: rgba(150, 124, 240, 0.85);
  --eq-core: rgba(150, 210, 255, 0.92);
  --eq-blur: 3px;
  --eq-blur-back: 9px;
  background:
    radial-gradient(
      120% 80% at 50% 14%,
      rgba(64, 54, 104, 0.16),
      transparent 56%
    ),
    radial-gradient(
      130% 95% at 50% 118%,
      rgba(38, 34, 70, 0.24),
      transparent 56%
    ),
    #060509;
}
.game-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 300px 80px rgba(0, 0, 0, 0.62);
}
.game-bg-glow {
  position: absolute;
  left: 50%;
  top: 40%;
  width: 640px;
  height: 440px;
  margin: -220px 0 0 -320px;
  background: radial-gradient(
    ellipse,
    rgba(116, 96, 188, 0.16),
    transparent 66%
  );
  filter: blur(12px);
}
.bg-eq-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 44%;
  height: 26%;
}
.bg-eq {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 0.5%;
}
.bg-eq-bar {
  flex: 1;
  height: 100%;
  transform-origin: center;
  transform: scaleY(var(--lo));
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--eq-edge) 40%,
    var(--eq-core) 50%,
    var(--eq-edge) 60%,
    transparent 100%
  );
  animation: bgEqBar 1s ease-in-out infinite alternate;
}
@keyframes bgEqBar {
  from {
    transform: scaleY(var(--lo));
  }
  to {
    transform: scaleY(var(--hi));
  }
}
.bg-eq-front {
  filter: blur(var(--eq-blur));
  opacity: 0.62;
}
.bg-eq-back {
  filter: blur(var(--eq-blur-back));
  opacity: 0.34;
}
@media (prefers-reduced-motion: reduce) {
  .game-bg * {
    animation: none !important;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: typecheck + build clean.

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/play/GameBackground.tsx src/ui/game/play/game-background.css
git commit -m "feat(play): dark backdrop + sharp glow visualizer (#9)"
```

---

## Task 5: Overview overlay (scoreboard)

**Files:**

- Create: `src/ui/game/play/Overview.tsx`
- Create: `src/ui/game/play/overview.css`
- Test: `src/ui/game/play/Overview.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/game/play/Overview.test.tsx
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Overview from './Overview'
import type { Player } from '@/core'

const players: Player[] = [
  { id: 'p0', name: 'Anna', timeline: [{ id: 'a', year: 1990 }] },
  { id: 'p1', name: 'Ben', timeline: [] },
]

test('shows the current player turn and each score', () => {
  render(<Overview players={players} currentIndex={0} target={10} />)
  expect(screen.getByText(/ANNA/i)).toBeInTheDocument()
  expect(screen.getByText('Ben')).toBeInTheDocument()
  expect(screen.getByText('1')).toBeInTheDocument() // Anna's count
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test -- Overview`
Expected: FAIL ("Failed to resolve import './Overview'").

- [ ] **Step 3: Implement**

```tsx
// src/ui/game/play/Overview.tsx
import type { Player } from '@/core'
import './overview.css'

export default function Overview({
  players,
  currentIndex,
  target,
}: {
  players: Player[]
  currentIndex: number
  target: number
}) {
  const turnName = players[currentIndex]?.name ?? ''
  return (
    <aside className="ov">
      <div className="ov-turn">
        <span className="ov-dot" />
        {turnName.toUpperCase()}&rsquo;S TURN
      </div>
      <div className="ov-rows">
        {players.map((p, i) => {
          const n = p.timeline.length
          return (
            <div
              className={`ov-row ${i === currentIndex ? 'on' : ''}`}
              key={p.id}
            >
              <span className="ov-name">{p.name}</span>
              <span className="ov-bar">
                <i style={{ width: `${Math.min(100, (n / target) * 100)}%` }} />
              </span>
              <span className="ov-count">
                {n}
                <b>/{target}</b>
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Add the CSS (port from the mock)**

Create `src/ui/game/play/overview.css` by porting the `.gm-overview` / `.gm-ov-*` rules from `src/ui/game/mock/game-mock.css`, renaming `gm-overview`→`ov`, `gm-ov-turn`→`ov-turn`, `gm-ov-dot`→`ov-dot`, `gm-ov-rows`→`ov-rows`, `gm-ov-row`→`ov-row`, `gm-ov-name`→`ov-name`, `gm-ov-bar`→`ov-bar`, `gm-ov-count`→`ov-count`. Keep `position: absolute; top: 22px; left: 22px; z-index: 6;` and the clip-path bevel.

- [ ] **Step 5: Run the tests + build**

Run: `npm run test -- Overview && npm run build`
Expected: PASS; build clean.

- [ ] **Step 6: Commit**

```bash
git add src/ui/game/play/Overview.tsx src/ui/game/play/overview.css src/ui/game/play/Overview.test.tsx
git commit -m "feat(play): overview scoreboard overlay (#9)"
```

---

## Task 6: Mystery card (now-playing / hidden)

**Files:**

- Create: `src/ui/game/play/MysteryCard.tsx`
- Create: `src/ui/game/play/mystery-card.css`
- Test: `src/ui/game/play/MysteryCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/game/play/MysteryCard.test.tsx
import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MysteryCard from './MysteryCard'

test('replay and pause call their handlers', async () => {
  const onReplay = vi.fn()
  const onPause = vi.fn()
  render(<MysteryCard onReplay={onReplay} onPause={onPause} />)
  await userEvent.click(screen.getByRole('button', { name: /replay/i }))
  await userEvent.click(screen.getByRole('button', { name: /pause/i }))
  expect(onReplay).toHaveBeenCalledOnce()
  expect(onPause).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test -- MysteryCard`
Expected: FAIL ("Failed to resolve import './MysteryCard'").

- [ ] **Step 3: Implement**

```tsx
// src/ui/game/play/MysteryCard.tsx
import './mystery-card.css'

export default function MysteryCard({
  onReplay,
  onPause,
}: {
  onReplay: () => void
  onPause: () => void
}) {
  return (
    <div className="mystery-wrap">
      <div className="h-card front mystery">
        <div className="myst-disc" />
        <div className="myst-eq" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </div>
        <span className="myst-q">?</span>
        <div className="myst-label">NOW PLAYING</div>
        <div className="myst-sub">MYSTERY TRACK</div>
      </div>
      <div className="myst-controls">
        <button className="myst-ctl" aria-label="Replay" onClick={onReplay}>
          &#8635;
        </button>
        <button className="myst-ctl" aria-label="Pause" onClick={onPause}>
          &#10073;&#10073;
        </button>
      </div>
      <div className="myst-hint">tap a slot below to place this</div>
    </div>
  )
}
```

- [ ] **Step 4: Add the CSS (port from the mock)**

Create `src/ui/game/play/mystery-card.css` by porting `.gm-mystery*`, `.gm-myst-*`, `.gm-ctl`, `.gm-place-hint` from `src/ui/game/mock/game-mock.css`, renaming the `gm-mystery-wrap`→`mystery-wrap`, `gm-mystery`→`mystery`, `gm-myst-disc`→`myst-disc`, `gm-myst-eq`→`myst-eq`, `gm-myst-q`→`myst-q`, `gm-myst-label`→`myst-label`, `gm-myst-sub`→`myst-sub`, `gm-myst-controls`→`myst-controls`, `gm-ctl`→`myst-ctl`, `gm-place-hint`→`myst-hint`. Add the mystery card's prismatic sheen here (the only card that shimmers) by copying the Hitster sheen `::before`/`::after` from `skin.css` but scoped to `.skin-hitster .h-card.mystery::before` / `::after` (single static drift, no `cN` delays). Keep `.mystery-wrap` absolutely centred (`left:50%; top:38%; transform:translate(-50%,-50%); z-index:4`).

- [ ] **Step 5: Run the tests + build**

Run: `npm run test -- MysteryCard && npm run build`
Expected: PASS; build clean.

- [ ] **Step 6: Commit**

```bash
git add src/ui/game/play/MysteryCard.tsx src/ui/game/play/mystery-card.css src/ui/game/play/MysteryCard.test.tsx
git commit -m "feat(play): mystery now-playing card (#9)"
```

---

## Task 7: Hand (fan of year cards + placement gaps)

**Files:**

- Create: `src/ui/game/play/HandCard.tsx`
- Create: `src/ui/game/play/Hand.tsx`
- Create: `src/ui/game/play/hand.css`
- Test: `src/ui/game/play/Hand.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/game/play/Hand.test.tsx
import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hand from './Hand'
import type { Card } from '@/core'

const timeline: Card[] = [
  { id: 'a', year: 1990 },
  { id: 'b', year: 2001 },
]

test('renders one placement gap per slot (N+1) and reports the tapped slot', async () => {
  const onPlace = vi.fn()
  render(<Hand timeline={timeline} onPlace={onPlace} />)
  // N cards -> N+1 gaps: 0,1,2
  expect(screen.getByTestId('gap-0')).toBeInTheDocument()
  expect(screen.getByTestId('gap-2')).toBeInTheDocument()
  await userEvent.click(screen.getByTestId('gap-2'))
  expect(onPlace).toHaveBeenCalledWith(2)
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test -- play/Hand`
Expected: FAIL ("Failed to resolve import './Hand'").

- [ ] **Step 3: Implement `HandCard`**

```tsx
// src/ui/game/play/HandCard.tsx
import { cardGradient } from './cardArt'
import './hand.css'

export default function HandCard({
  id,
  year,
  title,
}: {
  id: string
  year: number
  title?: string
}) {
  return (
    <div className="h-card front handcard">
      <span className="hc-year">{year}</span>
      <div className="hc-art" style={{ background: cardGradient(id) }} />
      {title && <div className="hc-title">{title}</div>}
      <div className="brand">Hitster</div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `Hand`**

```tsx
// src/ui/game/play/Hand.tsx
import { type CSSProperties } from 'react'
import type { Card } from '@/core'
import { handLayout } from './handGeometry'
import HandCard from './HandCard'
import './hand.css'

export default function Hand({
  timeline,
  onPlace,
  titleOf,
  piled = false,
}: {
  timeline: Card[]
  onPlace: (slotIndex: number) => void
  titleOf?: (id: string) => string | undefined
  piled?: boolean
}) {
  const { scale, cards } = handLayout(timeline.length)
  return (
    <div
      className={`hand ${piled ? 'piled' : ''}`}
      style={{ '--hand-scale': scale } as CSSProperties}
    >
      {timeline.map((card, i) => {
        const t = cards[i]
        return (
          <div
            className="hand-slot"
            key={card.id}
            style={
              {
                '--tx': `${t.tx}px`,
                '--ty': `${t.ty}px`,
                '--rot': `${t.rot}deg`,
                '--i': i,
                '--ci': timeline.length - 1 - i,
              } as CSSProperties
            }
          >
            <button
              className="hand-gap"
              data-testid={`gap-${i}`}
              aria-label={`Place before ${card.year}`}
              onClick={() => onPlace(i)}
            />
            <HandCard
              id={card.id}
              year={card.year}
              title={titleOf?.(card.id)}
            />
          </div>
        )
      })}
      {/* trailing gap after the last card */}
      <button
        className="hand-gap hand-gap-end"
        data-testid={`gap-${timeline.length}`}
        aria-label="Place at the end"
        onClick={() => onPlace(timeline.length)}
      />
    </div>
  )
}
```

- [ ] **Step 5: Add the CSS (port the fan from the mock)**

Create `src/ui/game/play/hand.css`. Port the fan geometry from `src/ui/game/mock/game-mock.css` (`.gm-hand`→`.hand`, `.gm-slot`→`.hand-slot`), keeping: `.hand { position:absolute; left:50%; bottom:21%; transform:scale(var(--hand-scale)); transform-origin:center bottom; z-index:3 }`, `.hand-slot { position:absolute; margin:-172px 0 0 -120px; transform-origin:50% 80%; transform:translate(var(--tx),var(--ty)) rotate(var(--rot)); transition:transform .6s cubic-bezier(.2,.72,.2,1); transition-delay:calc(var(--i)*40ms) }`, and the pile state `.hand.piled .hand-slot { transform:translate(0,0) rotate(0deg); transition-delay:calc(var(--ci)*40ms) }`. Add the year-card internals:

```css
.handcard {
  background: linear-gradient(160deg, #160e26, #0c0814);
  border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
  box-shadow:
    0 22px 46px -14px rgba(0, 0, 0, 0.8),
    0 0 30px -10px var(--glow);
}
.hc-year {
  position: absolute;
  top: 12px;
  left: 13px;
  font-size: 22px;
  font-weight: 900;
  color: var(--accent);
  z-index: 2;
}
.hc-art {
  margin: 38px auto 0;
  width: 196px;
  height: 196px;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.hc-title {
  margin-top: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #f3eefb;
  padding: 0 6px;
}
/* tappable gap target overlaying the left edge of each slot */
.hand-gap {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -28px;
  width: 56px;
  z-index: 4;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}
.hand-gap:hover {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.hand-gap-end {
  position: absolute;
  bottom: 21%;
  left: calc(50% + 96px);
  height: 200px;
  margin-bottom: 0;
}
```

(The `.brand` rule already comes from the shared `.skin-hitster .h-card .brand` after Task 1.)

- [ ] **Step 6: Run the tests + build**

Run: `npm run test -- play/Hand && npm run build`
Expected: PASS; build clean.

- [ ] **Step 7: Commit**

```bash
git add src/ui/game/play/HandCard.tsx src/ui/game/play/Hand.tsx src/ui/game/play/hand.css src/ui/game/play/Hand.test.tsx
git commit -m "feat(play): hand fan with placement gaps (#9)"
```

---

## Task 8: GameScreen (compose the listening state)

**Files:**

- Create: `src/ui/game/play/GameScreen.tsx`
- Create: `src/ui/game/play/game-screen.css`

- [ ] **Step 1: Implement**

```tsx
// src/ui/game/play/GameScreen.tsx
import type { GameState } from '@/core'
import { currentPlayer } from '@/core'
import GameBackground from './GameBackground'
import Overview from './Overview'
import MysteryCard from './MysteryCard'
import Hand from './Hand'
import './game-screen.css'

export default function GameScreen({
  state,
  onPlace,
  onPause,
  onReplay,
  titleOf,
  piled = false,
}: {
  state: GameState
  onPlace: (slotIndex: number) => void
  onPause: () => void
  onReplay: () => void
  titleOf?: (id: string) => string | undefined
  piled?: boolean
}) {
  return (
    <div className="game-screen">
      <GameBackground />
      <Overview
        players={state.players}
        currentIndex={state.currentPlayerIndex}
        target={state.config.targetCards}
      />
      <MysteryCard onPause={onPause} onReplay={onReplay} />
      <Hand
        timeline={currentPlayer(state).timeline}
        onPlace={onPlace}
        titleOf={titleOf}
        piled={piled}
      />
    </div>
  )
}
```

- [ ] **Step 2: Add the CSS**

```css
/* src/ui/game/play/game-screen.css */
.game-screen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg, #060509);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/play/GameScreen.tsx src/ui/game/play/game-screen.css
git commit -m "feat(play): compose the listening-state game screen (#9)"
```

---

## Task 9: Reveal overlay (restyled)

**Files:**

- Create: `src/ui/game/play/RevealOverlay.tsx`
- Create: `src/ui/game/play/reveal.css`

Keep the existing test IDs: `reveal`, `outcome`, `next`.

- [ ] **Step 1: Implement**

```tsx
// src/ui/game/play/RevealOverlay.tsx
import type { GameState } from '@/core'
import './reveal.css'

export default function RevealOverlay({
  state,
  onNext,
}: {
  state: GameState
  onNext: () => void
}) {
  if (!state.drawn || !state.lastOutcome) return null
  const { title, subtitle, year } = state.drawn.reveal
  const correct = state.lastOutcome.correct
  return (
    <div className="reveal-scrim">
      <section data-testid="reveal" className="reveal-card">
        <div className="reveal-year">{year}</div>
        <div className="reveal-title">
          {title}
          {subtitle ? `, ${subtitle}` : ''}
        </div>
        <p
          data-testid="outcome"
          className={`reveal-outcome ${correct ? 'ok' : 'no'}`}
        >
          {correct ? 'Correct, card kept.' : 'Wrong, card discarded.'}
        </p>
        <button data-testid="next" className="reveal-next" onClick={onNext}>
          <span>NEXT</span>
          <span className="reveal-k">&#9654;</span>
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Add the CSS**

```css
/* src/ui/game/play/reveal.css */
.reveal-scrim {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(4, 3, 10, 0.62);
  backdrop-filter: blur(5px);
}
.reveal-card {
  width: min(420px, 92vw);
  padding: 26px;
  text-align: center;
  color: #e8e2ff;
  background: var(--panel);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.85);
  clip-path: polygon(
    14px 0,
    100% 0,
    100% calc(100% - 14px),
    calc(100% - 14px) 100%,
    0 100%,
    0 14px
  );
}
.reveal-year {
  font-size: 52px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 26px var(--glow);
  line-height: 1;
}
.reveal-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
}
.reveal-outcome {
  margin-top: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.reveal-outcome.ok {
  color: #61e3a7;
}
.reveal-outcome.no {
  color: #ff6b8a;
}
.reveal-next {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 24px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--ink);
  background: var(--accent);
  border: none;
  clip-path: polygon(
    11px 0,
    100% 0,
    100% calc(100% - 11px),
    calc(100% - 11px) 100%,
    0 100%,
    0 11px
  );
}
.reveal-next:hover {
  box-shadow: 0 0 26px -4px var(--accent);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/play/RevealOverlay.tsx src/ui/game/play/reveal.css
git commit -m "feat(play): restyled reveal overlay (#9)"
```

---

## Task 10: Win screen (restyled)

**Files:**

- Create: `src/ui/game/play/WinScreen.tsx`
- Create: `src/ui/game/play/win.css`

Keep the test ID `winner` containing the text "wins".

- [ ] **Step 1: Implement**

```tsx
// src/ui/game/play/WinScreen.tsx
import type { GameState } from '@/core'
import { standings } from '@/core'
import './win.css'

export default function WinScreen({
  state,
  onPlayAgain,
}: {
  state: GameState
  onPlayAgain: () => void
}) {
  const winner = state.players.find((p) => p.id === state.winnerId)
  return (
    <div className="win-screen">
      <h1 data-testid="winner" className="win-title">
        {winner?.name} wins
      </h1>
      <ul className="win-standings">
        {standings(state).map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <b>{p.timeline.length}</b>
          </li>
        ))}
      </ul>
      <button className="win-again" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add the CSS**

```css
/* src/ui/game/play/win.css */
.win-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
  color: #e8e2ff;
  background:
    radial-gradient(820px 520px at 50% 36%, var(--glow), transparent 60%),
    var(--bg, #060509);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.win-title {
  font-family: var(--title-font, inherit);
  font-size: clamp(40px, 8vw, 92px);
  text-transform: uppercase;
  letter-spacing: 6px;
  color: var(--accent);
  text-shadow: 0 0 40px var(--glow);
}
.win-standings {
  list-style: none;
  padding: 0;
  margin: 0;
  width: min(320px, 86vw);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.win-standings li {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent);
  border-radius: 8px;
}
.win-standings b {
  color: var(--accent);
}
.win-again {
  margin-top: 8px;
  cursor: pointer;
  padding: 14px 28px;
  font-weight: 900;
  letter-spacing: 4px;
  color: var(--ink);
  background: var(--accent);
  border: none;
  clip-path: polygon(
    12px 0,
    100% 0,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    0 100%,
    0 12px
  );
}
.win-again:hover {
  box-shadow: 0 0 30px -4px var(--accent);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/play/WinScreen.tsx src/ui/game/play/win.css
git commit -m "feat(play): restyled win screen (#9)"
```

---

## Task 11: Wire GameContainer to the new screens

**Files:**

- Modify: `src/ui/game/GameContainer.tsx`

- [ ] **Step 1: Build a title lookup and render the new components**

In `src/ui/game/GameContainer.tsx`, add a memo lookup from the setup tracks and swap the rendered components. Replace the imports of `TurnScreen`, `RevealPanel`, `WinScreen` with:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import GameScreen from './play/GameScreen'
import RevealOverlay from './play/RevealOverlay'
import WinScreen from './play/WinScreen'
```

After `const [error, setError] = useState<string | null>(null)`, add:

```tsx
const titleById = useMemo(() => {
  const m = new Map<string, string>()
  for (const t of setup.tracks) m.set(t.id, t.title)
  return (id: string) => m.get(id)
}, [setup.tracks])
```

Replace the `if (isWon(state)) …` and final `return ( … TurnScreen/RevealPanel … )` block with:

```tsx
if (isWon(state))
  return (
    <WinScreen state={state} onPlayAgain={() => window.location.reload()} />
  )

return (
  <>
    {(error || session.error) && (
      <p className="reveal-err">{error ?? session.error}</p>
    )}
    <GameScreen
      state={state}
      titleOf={titleById}
      onPlace={(slot) => dispatch({ type: 'place', slotIndex: slot })}
      onPause={() => session.provider.pause()}
      onReplay={() =>
        state.drawn && play(`spotify:track:${state.drawn.card.id}`)
      }
    />
    {state.phase === 'revealed' && (
      <RevealOverlay state={state} onNext={next} />
    )}
  </>
)
```

(The `.reveal-err` style: append to `src/ui/game/play/reveal.css`:)

```css
.reveal-err {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  padding: 8px 14px;
  border-radius: 8px;
  background: #5a1020;
  color: #ffd7df;
  font-size: 13px;
}
```

- [ ] **Step 2: Run the full game E2E**

Run: `npm run test:e2e -- game.spec.ts`
Expected: PASS (menu → setup → review → start → place via `gap-*` → `reveal`/`next` → `winner` "wins").

- [ ] **Step 3: Verify lint + unit + build**

Run: `npm run lint && npm run test && npm run build`
Expected: clean; all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/GameContainer.tsx src/ui/game/play/reveal.css
git commit -m "feat(play): render the new play/reveal/win screens from GameContainer (#9)"
```

---

## Task 12: Turn-change fan→pile→fan animation

**Files:**

- Modify: `src/ui/game/GameContainer.tsx`

**Approach:** drive `piled` on `GameScreen` around the `next()` transition. When the player taps Next, pile the outgoing hand, let `advanceTurn` swap the player + draw, then unpile so the new hand fans out.

- [ ] **Step 1: Add piled state + sequence it around `next`**

In `src/ui/game/GameContainer.tsx`, add `const [piled, setPiled] = useState(false)` and wrap the existing `next` so the hand collapses, advances, then re-fans:

```tsx
async function nextWithTransition() {
  setPiled(true)
  await new Promise((r) => setTimeout(r, 420)) // let the fan collapse
  await next()
  setPiled(false) // new hand fans out
}
```

Pass `piled={piled}` to `<GameScreen … />` and use `onNext={nextWithTransition}` on `<RevealOverlay … />`.

- [ ] **Step 2: Manually verify in the dev app**

Run: `npm run dev`, play a mock game at `http://localhost:5173/?mock=1`, place a card, click Next; the hand should collapse to a pile and the next hand fan out.

- [ ] **Step 3: Re-run the game E2E (timing tolerant)**

Run: `npm run test:e2e -- game.spec.ts`
Expected: PASS (Playwright auto-waits for `gap-*` after the transition).

- [ ] **Step 4: Commit**

```bash
git add src/ui/game/GameContainer.tsx
git commit -m "feat(play): fan-to-pile turn-change transition (#9)"
```

---

## Task 13: Remove mocks/old screens; final verification

**Files:**

- Modify: `src/ui/App.tsx`
- Delete: `src/ui/game/mock/`, `src/ui/game/wireframe/`, `src/ui/game/TurnScreen.tsx`, `src/ui/game/RevealPanel.tsx`, `src/ui/game/WinScreen.tsx`

- [ ] **Step 1: Remove the mock + wireframe routes from App.tsx**

In `src/ui/App.tsx`, delete the `import GameWireframes …`, `import GameMock …` lines and the `if (params.get('gwire') === '1') …` and `if (params.get('gmock') === '1') …` route lines.

- [ ] **Step 2: Delete the dead files**

```bash
git rm -r src/ui/game/mock src/ui/game/wireframe
git rm src/ui/game/TurnScreen.tsx src/ui/game/RevealPanel.tsx src/ui/game/WinScreen.tsx
```

- [ ] **Step 3: Full verification loop**

Run: `npm run lint && npm run test && npm run build && npm run test:e2e`
Expected: lint clean; all unit tests pass; build clean; all 4 E2E specs pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(play): remove game mockups + old Turn/Reveal/Win screens (#9)"
```

- [ ] **Step 5: Finish the branch**

Use superpowers:finishing-a-development-branch (push + PR referencing #9, or merge), per the project's GitHub workflow.

---

## Self-Review

- **Spec coverage:** layout (Tasks 5–8), hand geometry + 1–20 scaling (Task 2,7), background + sharp visualizer (Task 4), mystery card (Task 6), placement gaps (Task 7), reveal (Task 9), win (Task 10), turn-change fan↔pile (Task 12), card extraction (Task 1), state mapping via GameContainer (Task 11), test-id preservation (Tasks 7,9,10,11). New-deck slide-in is covered by the same pile→fan in Task 12 (the new hand fans out on unpile). ✓
- **Known simplification (vs mock):** hand cards show year + optional title over a deterministic gradient, not per-track album images (not available from `SpotifyTrack`). Flagged in File Structure. ✓
- **Type consistency:** `handLayout`→`{scale, cards:[{rot,tx,ty}]}` used in Hand; `cardGradient(id)` used in HandCard; `titleOf`/`titleById` naming consistent across Hand/GameScreen/GameContainer; engine `Player`/`Card`/`GameState`/`currentPlayer`/`standings` match `src/core`. ✓
- **Placeholders:** none. ✓
