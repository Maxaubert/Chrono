# Front Page (Main Menu) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare app entry with the approved front page / main menu (fan of Chrono cards + cyberpunk menu), where PLAY enters the existing game and the other buttons are visible placeholders.

**Architecture:** A new `src/ui/menu/` module holds the menu screen, a decorative song-card component, and the menu's bespoke CSS (Ultra Violet tokens + keyframes). `App.tsx` gains a top-level `screen` state (`menu | game`); PLAY flips it to `game`, which renders the existing `GameContainer` unchanged. The Spotify/engine layers are untouched.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 for layout, a scoped `menu.css` for the cyberpunk visuals/animations, Vitest + Testing Library for component tests, Playwright for E2E.

**Styling source of truth:** the approved throwaway mockups in the slice-2 worktree, `src/ui/MenuSplitShowcase.tsx` (`PAGE_CSS`) and `src/ui/ChronoCard.tsx` (`CARD_CSS` + components). Port their CSS into `menu.css` and their card markup into `SongCard.tsx`, dropping the palette switcher (violet only) and the genre label (already removed).

---

### Task 1: Menu styles + Ultra Violet tokens

**Files:**

- Create: `src/ui/menu/menu.css`

- [ ] **Step 1: Create `menu.css`** scoped under `.menu-screen`:
  - Define tokens on `.menu-screen`: `--bg:#08060f; --panel:#0e0a1a; --accent:#9a6bff; --accent2:#6b3fd6; --glow:rgba(154,107,255,.17); --ink:#0f0820; --ok:#46e08a; --no:#ff4d6a;`
  - Port `CARD_CSS` from `ChronoCard.tsx` verbatim (card base, foil sweep + stagger, idx, front art/info/brand, outcome states, back vinyl/eq/prompt). The fixed foil keyframe (soft bar that parks off-card) is already correct.
  - Port the layout CSS from `MenuSplitShowcase.tsx` `PAGE_CSS` EXCEPT the `.switcher*` rules: `.screen`, `.slash*`, `.corner*`, `.split`, `.left/.hand/.fan-slot/.c1..c4/@keyframes deal`, `.right/.kicker/.tag`, `.logo + glitch gA/gB + .crt/@keyframes crt`, `.menu/.btn*`, `.foot`, `.el/.d1..d8/@keyframes rise`, and the `@media(max-width:820px)` block.
  - Replace the outer `.split-root` selector with `.menu-screen` and drop `background:#000` page chrome that belonged to the showcase harness.

- [ ] **Step 2: Verify it imports** — `npm run build` later will typecheck; CSS has no test. Confirm no `var(--c)` (switcher-only) references remain.

- [ ] **Step 3: Commit**

```bash
git add src/ui/menu/menu.css
git commit -m "feat(menu): add front-page styles and Ultra Violet tokens (#5)"
```

---

### Task 2: Decorative SongCard component

**Files:**

- Create: `src/ui/menu/SongCard.tsx`
- Test: `src/ui/menu/SongCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { CardFront, CardBack, SAMPLE_DECK } from './SongCard'

test('CardFront shows the year, title and artist', () => {
  render(<CardFront song={SAMPLE_DECK[0]} />)
  expect(screen.getAllByText(SAMPLE_DECK[0].year).length).toBeGreaterThan(0)
  expect(screen.getByText(SAMPLE_DECK[0].title)).toBeInTheDocument()
  expect(screen.getByText(SAMPLE_DECK[0].artist)).toBeInTheDocument()
})

test('CardBack shows the guess prompt', () => {
  render(<CardBack />)
  expect(screen.getByText('GUESS THE YEAR')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, verify it fails** — `npm run test -- SongCard` → FAIL (module not found).

- [ ] **Step 3: Implement `SongCard.tsx`** — port `Song`, `AlbumArt`, `CardFront`, `CardBack` from the mockup `ChronoCard.tsx` (no genre). Rename `DECK` → `SAMPLE_DECK` and add a comment that the art gradients are decorative placeholders (real cards use Spotify album images). No CSS export (styles live in `menu.css`).

- [ ] **Step 4: Run the test, verify it passes** — `npm run test -- SongCard` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/menu/SongCard.tsx src/ui/menu/SongCard.test.tsx
git commit -m "feat(menu): decorative SongCard (front/back) for the menu fan (#5)"
```

---

### Task 3: MenuScreen component

**Files:**

- Create: `src/ui/menu/MenuScreen.tsx`
- Test: `src/ui/menu/MenuScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuScreen from './MenuScreen'

test('PLAY calls onPlay', async () => {
  const onPlay = vi.fn()
  render(<MenuScreen onPlay={onPlay} />)
  await userEvent.click(screen.getByTestId('menu-play'))
  expect(onPlay).toHaveBeenCalledOnce()
})

test('placeholder buttons are present but disabled', () => {
  render(<MenuScreen onPlay={() => {}} />)
  for (const id of [
    'menu-choose-game',
    'menu-create-room',
    'menu-join-room',
    'menu-settings',
  ]) {
    expect(screen.getByTestId(id)).toBeDisabled()
  }
})
```

- [ ] **Step 2: Run it, verify it fails** — FAIL (module not found).

- [ ] **Step 3: Implement `MenuScreen.tsx`**
  - `import './menu.css'`, `import { CardFront, SAMPLE_DECK } from './SongCard'`.
  - Signature: `export default function MenuScreen({ onPlay }: { onPlay: () => void })`.
  - Root `<div className="menu-screen">` containing the `screen` markup ported from `MenuSplitShowcase` (slashes, corners, `.split` → `.left` fan of 4 `CardFront` in `.fan-slot c1..c4` with `pointer-events:none`, `.right` with kicker, `.logo.crt`, tag, `.menu`).
  - PLAY button: `data-testid="menu-play"` `onClick={onPlay}`.
  - Placeholders: `data-testid` per the test, `disabled`, add `title="Coming soon"`; keep the `.bx` sublabels.
  - Drop the palette switcher and the `key`/replay remount logic (animations just play on mount).

- [ ] **Step 4: Run the test, verify it passes** — PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/menu/MenuScreen.tsx src/ui/menu/MenuScreen.test.tsx
git commit -m "feat(menu): MenuScreen front page with wired PLAY + placeholders (#5)"
```

---

### Task 4: Wire the menu into the app

**Files:**

- Modify: `src/ui/App.tsx`
- Test: `src/ui/App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('starts on the menu, PLAY enters the game setup', async () => {
  render(<App />)
  expect(screen.getByTestId('menu-play')).toBeInTheDocument()
  expect(screen.queryByTestId('target')).not.toBeInTheDocument()
  await userEvent.click(screen.getByTestId('menu-play'))
  expect(screen.getByTestId('target')).toBeInTheDocument() // SetupScreen now showing
})
```

- [ ] **Step 2: Run it, verify it fails** — FAIL (App renders GameContainer directly).

- [ ] **Step 3: Implement `App.tsx`**

```tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'

export default function App() {
  const spike = new URLSearchParams(window.location.search).get('spike') === '1'
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  if (spike) return <SpikeHarness />
  if (screen === 'menu') return <MenuScreen onPlay={() => setScreen('game')} />
  return <GameContainer />
}
```

- [ ] **Step 4: Run the test, verify it passes** — PASS. Then run the full unit suite: `npm run test`.

- [ ] **Step 5: Commit**

```bash
git add src/ui/App.tsx src/ui/App.test.tsx
git commit -m "feat(menu): show the menu first, PLAY enters the game (#5)"
```

---

### Task 5: Update E2E for the new entry

**Files:**

- Modify: `e2e/game.spec.ts:6` (after `page.goto`)
- Review: `e2e/smoke.spec.ts`

- [ ] **Step 1: Add the PLAY click** to `game.spec.ts` right after `await page.goto('/?mock=1')`:

```ts
await page.getByTestId('menu-play').click()
```

- [ ] **Step 2: Check `smoke.spec.ts`** — if it asserts setup/landing content that is now behind the menu, update it (e.g. assert `menu-play` is visible, or click it first). If it only checks the page loads, leave it.

- [ ] **Step 3: Run E2E** — `npm run test:e2e` → all specs pass (game flow reaches `winner`).

- [ ] **Step 4: Commit**

```bash
git add e2e/game.spec.ts e2e/smoke.spec.ts
git commit -m "test(e2e): click PLAY to enter the game from the new menu (#5)"
```

---

### Task 6: Responsive pass + final verification

**Files:** none expected (CSS already has the `@media(max-width:820px)` block); adjust `menu.css` only if a breakpoint looks wrong.

- [ ] **Step 1: Manual check** at phone / tablet / desktop widths via `npm run dev` (`/`). Confirm the fan scales and the menu stacks under the cards on narrow screens. Tweak the media query in `menu.css` if needed.
- [ ] **Step 2: Full verification** — `npm run lint && npm run test && npm run build && npm run test:e2e`, all green.
- [ ] **Step 3: Commit any tweaks**

```bash
git add -A
git commit -m "style(menu): responsive tweaks for the front page (#5)"
```

---

## Self-Review notes

- **Spec coverage:** split layout (T1/T3), violet palette (T1), CRT logo (T1/T3), card fan (T2/T3), PLAY wired + placeholders disabled (T3/T4), responsive (T1/T6), E2E updated (T5). Covered.
- **Out of scope (not in any task):** Choose-game/room/settings features, in-game screen redesign, promoting violet tokens globally. Intentional.
- **Type consistency:** `SAMPLE_DECK`/`Song`/`CardFront`/`CardBack` used identically across T2/T3; `onPlay: () => void` across T3/T4; testids `menu-play`, `menu-choose-game`, `menu-create-room`, `menu-join-room`, `menu-settings` consistent T3/T4/T5.
