# Star Wars Deck + Shared Deck-Driven Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Star Wars as the first specialized timeline game, riding a shared static-deck adapter, with BBY/ABY labels and typographic (image-less) cards.

**Architecture:** Extract the deck shuffle/assembly glue into shared helpers (`staticDeck`, `makeDeckPlay`, `StaticDeckSetup`, `TypographicMystery`); thread an optional `yearLabel` through the shared reveal + timeline so BBY/ABY (and History's BCE) display correctly; add a self-contained `starwars` game module (theme + skin + deck.json) and wire it into the registry and the `App` adapter map. The engine, turns, scoring, and win flow are unchanged.

**Tech Stack:** React 19 + TypeScript, Vite, Vitest (+ jsdom, Testing Library), Playwright. `@/` aliases `src/`.

**Spec:** `docs/superpowers/specs/2026-06-07-starwars-deck-design.md`

---

## File Structure

| File                                            | Responsibility                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/ui/game/deck/staticDeck.ts` (new)          | `shuffle` + `makeStaticDeck(cards, toDrawn, rng)` — generic shuffled `DeckHandle` |
| `src/ui/game/deck/makeDeckPlay.tsx` (new)       | `makeDeckPlay(config)` → `GamePlay` for a static deck                             |
| `src/ui/game/deck/TypographicMystery.tsx` (new) | `makeTypographicMystery(clueById, kicker)` → image-less mystery card              |
| `src/ui/game/deck/StaticDeckSetup.tsx` (new)    | Theme-driven players+win-target popup (shared testids)                            |
| `src/ui/game/deck/static-setup.css` (new)       | Setup popup styling (var-driven)                                                  |
| `src/ui/game/deck/static-play.css` (new)        | Typographic mystery clue card styling (var-driven)                                |
| `src/core/types.ts` (modify)                    | Add `yearLabel?: string` to `CardReveal`                                          |
| `src/ui/game/play/RevealOverlay.tsx` (modify)   | Render `yearLabel ?? year`                                                        |
| `src/ui/game/play/HandCard.tsx` (modify)        | `year: number \| string`                                                          |
| `src/ui/game/play/Hand.tsx` (modify)            | Thread `labelOf`, render label on placed cards                                    |
| `src/ui/game/play/GameScreen.tsx` (modify)      | Thread `labelOf` to `Hand`                                                        |
| `src/ui/game/GameContainer.tsx` (modify)        | Record `labelById`, pass `labelOf`                                                |
| `src/ui/game/history/deck.ts` (modify)          | Use `makeStaticDeck`; add `yearLabel` to reveal                                   |
| `src/games/starwars/index.ts` (new)             | `GameModule` + crawl theme                                                        |
| `src/games/starwars/skin.css` (new)             | `skin-starwars` FanCard/reveal styling                                            |
| `src/games/starwars/StarWarsCard.tsx` (new)     | Typographic menu FanCard                                                          |
| `src/games/starwars/deck.json` (new)            | 10 canon events                                                                   |
| `src/ui/game/starwars/deck.ts` (new)            | Load SW deck, `clueBySlug`, `toDrawn`                                             |
| `src/ui/game/starwars/play.tsx` (new)           | `makeStarWarsPlay()` → `makeDeckPlay`                                             |
| `src/games/index.ts` (modify)                   | Register `starwars`                                                               |
| `src/ui/App.tsx` (modify)                       | Adapter map includes `starwars`                                                   |
| `e2e/starwars.spec.ts` (new)                    | Smoke playthrough + BBY/ABY reveal                                                |

---

## Task 1: Shared `staticDeck` helper + refactor History deck loader

**Files:**

- Create: `src/ui/game/deck/staticDeck.ts`
- Create: `src/ui/game/deck/staticDeck.test.ts`
- Modify: `src/ui/game/history/deck.ts`
- Modify: `src/ui/game/history/deck.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/ui/game/deck/staticDeck.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { DrawnCard } from '@/core'
import { makeStaticDeck, shuffle } from './staticDeck'

type Raw = { id: string; year: number }
const RAW: Raw[] = [
  { id: 'a', year: 1 },
  { id: 'b', year: 2 },
  { id: 'c', year: 3 },
]
const toDrawn = (c: Raw): DrawnCard => ({
  card: { id: c.id, year: c.year },
  reveal: { title: c.id, subtitle: 'x', year: c.year },
})

describe('makeStaticDeck', () => {
  it('draws every card once, then null', async () => {
    const handle = makeStaticDeck(RAW, toDrawn, () => 0)
    const seen: string[] = []
    let d = await handle.next()
    while (d) {
      seen.push(d.card.id)
      d = await handle.next()
    }
    expect(seen.sort()).toEqual(['a', 'b', 'c'])
    expect(await handle.next()).toBeNull()
  })

  it('maps raw cards through toDrawn', async () => {
    const first = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    expect(typeof first!.card.id).toBe('string')
    expect(typeof first!.card.year).toBe('number')
    expect(first!.reveal.year).toBe(first!.card.year)
  })

  it('shuffles deterministically with the injected rng', async () => {
    const a = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    const b = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    expect(a!.card.id).toBe(b!.card.id)
  })
})

describe('shuffle', () => {
  it('returns a new array holding the same elements', () => {
    const out = shuffle(RAW, () => 0.5)
    expect(out).not.toBe(RAW)
    expect(out.map((c) => c.id).sort()).toEqual(['a', 'b', 'c'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- staticDeck`
Expected: FAIL — `Cannot find module './staticDeck'`.

- [ ] **Step 3: Write the helper**

Create `src/ui/game/deck/staticDeck.ts`:

```ts
import type { DrawnCard } from '@/core'
import type { DeckHandle } from '../play/adapter'

/** Fisher-Yates shuffle into a new array using an injected rng (0..1). */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A DeckHandle over a static, shuffled card list. `toDrawn` maps each raw card
 *  to the engine's DrawnCard. Years are known up front, but next() stays async
 *  to satisfy the DeckHandle contract (Hitster resolves years lazily). */
export function makeStaticDeck<T>(
  cards: readonly T[],
  toDrawn: (card: T) => DrawnCard,
  rng: () => number,
): DeckHandle {
  const pile = shuffle(cards, rng)
  let i = 0
  return {
    async next() {
      return i < pile.length ? toDrawn(pile[i++]) : null
    },
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- staticDeck`
Expected: PASS (4 tests).

- [ ] **Step 5: Refactor History's deck loader onto the helper**

Replace `src/ui/game/history/deck.ts` entirely with:

```ts
import rawDeck from '@/games/history/deck.json'
import type { DrawnCard } from '@/core'
import type { DeckHandle } from '../play/adapter'
import { makeStaticDeck } from '../deck/staticDeck'

interface HistoryCardData {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  description: string
}

const CARDS = rawDeck.cards as HistoryCardData[]

/** Slug -> card image path (derived from the slug). */
export const imageBySlug = new Map(
  CARDS.map((c) => [c.slug, `/history/${c.slug}.jpg`] as const),
)
/** Slug -> guess clue (the description shown on the mystery card). */
export const clueBySlug = new Map(
  CARDS.map((c) => [c.slug, c.description] as const),
)

function toDrawn(c: HistoryCardData): DrawnCard {
  return {
    card: { id: c.slug, year: c.year },
    reveal: {
      title: c.title,
      subtitle: c.era,
      year: c.year,
      yearLabel: c.yearLabel,
    },
  }
}

/** A DeckHandle over the shuffled History deck (static; years are known). */
export function makeHistoryDeck(rng: () => number): DeckHandle {
  return makeStaticDeck(CARDS, toDrawn, rng)
}
```

Note: `reveal.yearLabel` is added here; it does nothing until Task 2 renders it, but it is harmless now (optional field added to the type in Task 2 — run Task 2's `src/core/types.ts` edit before typechecking if doing `npm run build`; `npm run test` does not typecheck and stays green).

- [ ] **Step 6: Fix the stale card-count assertion**

In `src/ui/game/history/deck.test.ts`, change the exhaustion assertion (the deck has 200 cards, not 100):

```ts
expect(n).toBe(200)
```

- [ ] **Step 7: Run History deck tests**

Run: `npm run test -- history/deck staticDeck`
Expected: PASS (existing History deck tests + the 4 new staticDeck tests). The `toBe(200)` assertion now passes.

- [ ] **Step 8: Commit**

```bash
git add src/ui/game/deck/staticDeck.ts src/ui/game/deck/staticDeck.test.ts src/ui/game/history/deck.ts src/ui/game/history/deck.test.ts
git commit -m "refactor: extract shared static-deck helper; History uses it"
```

---

## Task 2: Year-label support in the shared engine UI

Threads the existing `yearLabel` through the shared reveal and timeline so Star Wars shows "32 BBY"/"0 ABY" and History's BCE cards show "3100 BC" instead of `-3100`.

**Files:**

- Modify: `src/core/types.ts`
- Modify: `src/ui/game/play/RevealOverlay.tsx`
- Modify: `src/ui/game/play/HandCard.tsx`
- Modify: `src/ui/game/play/Hand.tsx`
- Modify: `src/ui/game/play/GameScreen.tsx`
- Modify: `src/ui/game/GameContainer.tsx`
- Create: `src/ui/game/play/HandCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/ui/game/play/HandCard.test.tsx`:

```tsx
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HandCard from './HandCard'

test('renders a numeric year', () => {
  render(<HandCard id="a" year={1969} title="Moon" />)
  expect(screen.getByText('1969')).toBeInTheDocument()
})

test('renders a string year label (e.g. BBY/ABY or BCE)', () => {
  render(<HandCard id="b" year="32 BBY" title="Naboo" />)
  expect(screen.getByText('32 BBY')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- HandCard`
Expected: FAIL on the second test — `HandCard` types `year: number`, so `"32 BBY"` is a type error and the string is not accepted. (If the bundler renders it anyway, the test still drives the intended change; proceed to make `year` accept a string.)

- [ ] **Step 3: Widen `HandCard`'s `year` prop**

In `src/ui/game/play/HandCard.tsx`, change the prop type (line ~5) from `year: number` to:

```tsx
year: number | string
```

(The JSX `<span className="hc-year">{year}</span>` already renders either.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- HandCard`
Expected: PASS (2 tests).

- [ ] **Step 5: Add `yearLabel` to the core reveal type**

In `src/core/types.ts`, extend `CardReveal`:

```ts
/** What is shown when a card's identity is revealed after a guess. */
export interface CardReveal {
  title: string
  subtitle?: string
  year: number
  /** Optional display label for the year (e.g. "3100 BC", "32 BBY"). Falls back
   *  to `year` when absent. `year` stays the numeric sort/scoring key. */
  yearLabel?: string
}
```

- [ ] **Step 6: Render the label in `RevealOverlay`**

In `src/ui/game/play/RevealOverlay.tsx`, change the destructure + the year span:

```tsx
const { title, subtitle, year, yearLabel } = state.drawn.reveal
```

```tsx
<span className="reveal-c-year">{yearLabel ?? year}</span>
```

- [ ] **Step 7: Thread `labelOf` through `Hand`**

In `src/ui/game/play/Hand.tsx`, add `labelOf` to the destructured props and the prop type (alongside `imageOf`):

```tsx
  imageOf,
  labelOf,
  piled = false,
```

```tsx
  imageOf?: (id: string) => string | null | undefined
  labelOf?: (id: string) => string | undefined
  piled?: boolean
```

Then in the rendered card (the `aria-label` and the `<HandCard>` `year` prop), prefer the label:

```tsx
                aria-label={`Card ${labelOf?.(it.card.id) ?? it.card.year}`}
```

```tsx
<HandCard
  id={it.card.id}
  year={labelOf?.(it.card.id) ?? it.card.year}
  title={titleOf?.(it.card.id)}
  artist={artistOf?.(it.card.id)}
  image={imageOf?.(it.card.id)}
/>
```

- [ ] **Step 8: Thread `labelOf` through `GameScreen`**

In `src/ui/game/play/GameScreen.tsx`, add `labelOf` to the destructure and prop type (next to `imageOf`), and pass it to `<Hand>`:

```tsx
  imageOf,
  labelOf,
  piled = false,
```

```tsx
  imageOf?: (id: string) => string | null | undefined
  labelOf?: (id: string) => string | undefined
  piled?: boolean
```

```tsx
<Hand
  timeline={currentPlayer(state).timeline}
  onPlace={onPlace}
  titleOf={titleOf}
  artistOf={artistOf}
  imageOf={imageOf}
  labelOf={labelOf}
  piled={piled}
  interactive={interactive}
/>
```

- [ ] **Step 9: Record and pass the label in `GameContainer`**

In `src/ui/game/GameContainer.tsx`:

Add the ref next to `artistById` (line ~36):

```tsx
const labelById = useRef(new Map<string, string | undefined>())
```

Add the accessor next to `artistOf` (line ~62):

```tsx
const labelOf = (id: string) => labelById.current.get(id)
```

Record it inside `record()` (after the `artistById` line, ~69):

```tsx
labelById.current.set(drawn.card.id, drawn.reveal.yearLabel)
```

Pass it to `<GameScreen>` (next to `imageOf={imageOf}`, ~196):

```tsx
labelOf = { labelOf }
```

- [ ] **Step 10: Run the affected tests + typecheck**

Run: `npm run test -- HandCard Hand history/deck`
Expected: PASS (existing Hand tests unaffected — `labelOf` is optional; HandCard tests pass).

Run: `npm run build`
Expected: typecheck + build succeed (the `reveal.yearLabel` set in Task 1's History `toDrawn` now matches the type).

- [ ] **Step 11: Commit**

```bash
git add src/core/types.ts src/ui/game/play/RevealOverlay.tsx src/ui/game/play/HandCard.tsx src/ui/game/play/HandCard.test.tsx src/ui/game/play/Hand.tsx src/ui/game/play/GameScreen.tsx src/ui/game/GameContainer.tsx
git commit -m "feat: optional yearLabel on reveal + timeline (fixes BCE labels)"
```

---

## Task 3: Shared deck-driven play assembly (`makeDeckPlay`, `TypographicMystery`, `StaticDeckSetup`)

**Files:**

- Create: `src/ui/game/deck/makeDeckPlay.tsx`
- Create: `src/ui/game/deck/makeDeckPlay.test.tsx`
- Create: `src/ui/game/deck/TypographicMystery.tsx`
- Create: `src/ui/game/deck/static-play.css`
- Create: `src/ui/game/deck/StaticDeckSetup.tsx`
- Create: `src/ui/game/deck/static-setup.css`

- [ ] **Step 1: Write the failing test**

Create `src/ui/game/deck/makeDeckPlay.test.tsx`:

```tsx
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { DrawnCard } from '@/core'
import { makeDeckPlay } from './makeDeckPlay'
import { makeTypographicMystery } from './TypographicMystery'

type Raw = { id: string; year: number }
const RAW: Raw[] = [{ id: 'a', year: 1 }]
const toDrawn = (c: Raw): DrawnCard => ({
  card: { id: c.id, year: c.year },
  reveal: { title: c.id, year: c.year },
})
const Mystery = makeTypographicMystery(new Map([['a', 'a clue']]), 'When?')

test('makeDeckPlay builds an initDeck that draws the static cards', async () => {
  const play = makeDeckPlay({
    cards: RAW,
    toDrawn,
    Mystery,
    Setup: () => null,
  })
  const handle = await play.initDeck({ names: ['x'], targetCards: 5 }, () => 0)
  const first = await handle.next()
  expect(first!.card.id).toBe('a')
  expect(play.revealImage).toBeUndefined()
})

test('makeTypographicMystery renders the clue for the drawn card', () => {
  render(
    <Mystery
      drawn={toDrawn(RAW[0])}
      isPlaying={false}
      onPause={() => {}}
      onResume={() => {}}
      onReplay={() => {}}
    />,
  )
  expect(screen.getByText('a clue')).toBeInTheDocument()
  expect(screen.getByText('When?')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- makeDeckPlay`
Expected: FAIL — `Cannot find module './makeDeckPlay'`.

- [ ] **Step 3: Write `makeDeckPlay`**

Create `src/ui/game/deck/makeDeckPlay.tsx`:

```tsx
import type { ComponentType } from 'react'
import type { DrawnCard } from '@/core'
import type { GamePlay, GameSetupProps, MysteryProps } from '../play/adapter'
import { makeStaticDeck } from './staticDeck'

export interface DeckPlayConfig<T> {
  cards: readonly T[]
  toDrawn: (card: T) => DrawnCard
  Mystery: ComponentType<MysteryProps>
  Setup: ComponentType<GameSetupProps>
  /** Omit for a typographic (image-less) deck. */
  revealImage?: (drawn: DrawnCard) => string | undefined
}

/** Assemble a GamePlay for a static deck. The engine, turns, reveal and win flow
 *  are shared; only the cards, mystery, setup and (optional) reveal image vary. */
export function makeDeckPlay<T>(config: DeckPlayConfig<T>): GamePlay {
  return {
    initDeck: (_result, rng) =>
      makeStaticDeck(config.cards, config.toDrawn, rng),
    Mystery: config.Mystery,
    Setup: config.Setup,
    revealImage: config.revealImage,
  }
}
```

- [ ] **Step 4: Write `TypographicMystery` + its CSS**

Create `src/ui/game/deck/TypographicMystery.tsx`:

```tsx
import type { ComponentType } from 'react'
import type { MysteryProps } from '../play/adapter'
import './static-play.css'

/** Build a silent, image-less mystery card: a kicker + the card's text clue.
 *  The clue is looked up by card id. Used by typographic decks (Star Wars). */
export function makeTypographicMystery(
  clueById: Map<string, string | undefined>,
  kicker: string,
): ComponentType<MysteryProps> {
  return function TypographicMystery({ drawn }: MysteryProps) {
    const clue = drawn ? clueById.get(drawn.card.id) : undefined
    return (
      <div className="mystery-wrap">
        <div className="h-card sd-myst">
          <div className="sd-myst-kicker">{kicker}</div>
          <p className="sd-myst-clue">{clue}</p>
        </div>
        <div className="myst-hint">tap a slot below to place it</div>
      </div>
    )
  }
}
```

Create `src/ui/game/deck/static-play.css` (`.mystery-wrap`/`.myst-hint`/`.h-card` are global; only the `sd-myst*` faces are new, styled from theme CSS vars):

```css
/* Typographic mystery clue card for image-less decks. Scoped under .game-screen
 * like the other mystery styles; colours come from the active theme's CSS vars. */
.game-screen .h-card.sd-myst {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 26px 22px;
  text-align: center;
  background:
    radial-gradient(
      120% 80% at 50% 0%,
      color-mix(in srgb, var(--accent) 12%, transparent),
      transparent 70%
    ),
    var(--panel);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  box-shadow: 0 0 40px -10px var(--glow);
}

.game-screen .sd-myst-kicker {
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--accent);
}

.game-screen .sd-myst-clue {
  margin: 0;
  font-size: 19px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--accent) 92%, #fff);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- makeDeckPlay`
Expected: PASS (2 tests).

- [ ] **Step 6: Write `StaticDeckSetup` + its CSS**

Create `src/ui/game/deck/StaticDeckSetup.tsx` (generic, theme-driven; preserves the load-bearing data-testids the shared e2e relies on):

```tsx
import { useState } from 'react'
import { useActiveGame } from '../../theme/activeGameContext'
import type { GameSetupProps } from '../play/adapter'
import './static-setup.css'

/**
 * Generic new-game setup for a static-deck game (no audio, no Spotify): players
 * + win target, then START. Theme-driven — the wordmark/tagline come from the
 * active game's theme, and colours from its CSS variables, so each specialized
 * deck (Star Wars, ...) gets its own look with no per-game setup code. The
 * data-testids (name-0..5, target, start-game, player-plus/minus, setup-close)
 * are load-bearing for the shared e2e and must not change.
 */
export default function StaticDeckSetup({ onStart, onClose }: GameSetupProps) {
  const { game } = useActiveGame()
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState(10)

  function setCountAndNames(n: number) {
    const c = Math.min(6, Math.max(2, n))
    setCount(c)
    setNames((prev) => {
      const next = prev.slice(0, c)
      while (next.length < c) next.push('')
      return next
    })
  }

  const namesReady = names.every((n) => n.trim().length > 0)

  return (
    <div
      className="sd-screen"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sd-frame">
        {onClose && (
          <button
            className="sd-close"
            data-testid="setup-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        )}

        <aside className="sd-rail">
          <div className="sd-kicker">New Game</div>
          <div className="sd-wordmark">{game.theme.title}</div>
          <div className="sd-blurb">{game.theme.tagline}</div>
        </aside>

        <main className="sd-form">
          <section className="sd-section">
            <div className="sd-label">Players</div>
            <div className="sd-stepper">
              <button
                className="sd-step-btn"
                data-testid="player-minus"
                aria-label="Fewer players"
                disabled={count <= 2}
                onClick={() => setCountAndNames(count - 1)}
              >
                &minus;
              </button>
              <div className="sd-step-val">
                {count}
                <span className="sd-step-unit">of 6</span>
              </div>
              <button
                className="sd-step-btn"
                data-testid="player-plus"
                aria-label="More players"
                disabled={count >= 6}
                onClick={() => setCountAndNames(count + 1)}
              >
                +
              </button>
            </div>
            <div className="sd-names">
              {names.map((name, i) => (
                <label className="sd-name" key={i}>
                  <span className="sd-name-idx">{i + 1}</span>
                  <input
                    data-testid={`name-${i}`}
                    placeholder={`Player ${i + 1}`}
                    value={name}
                    onChange={(e) =>
                      setNames((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="sd-section">
            <div className="sd-label">Win At</div>
            <div className="sd-winrow">
              <input
                className="sd-win"
                data-testid="target"
                type="number"
                min={2}
                max={20}
                value={target}
                onChange={(e) =>
                  setTarget(Math.min(20, Math.max(2, Number(e.target.value))))
                }
              />
              <span className="sd-win-sub">cards to win</span>
              <input
                className="sd-slider"
                type="range"
                min={2}
                max={20}
                value={Math.min(20, target)}
                onChange={(e) => setTarget(Number(e.target.value))}
                aria-label="cards to win"
              />
            </div>
          </section>

          <button
            className="sd-start"
            data-testid="start-game"
            disabled={!namesReady}
            onClick={() =>
              onStart({
                names: names.map((n) => n.trim()),
                targetCards: target,
              })
            }
          >
            <span>Start Game</span>
            <span className="sd-k">&#9656;</span>
          </button>
        </main>
      </div>
    </div>
  )
}
```

Create `src/ui/game/deck/static-setup.css` (var-driven; functional layout — the e2e checks testids/visibility, polish can iterate):

```css
/* Generic static-deck setup popup. Colours from the active theme's CSS vars. */
.sd-screen {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: color-mix(in srgb, var(--bg) 80%, rgba(0, 0, 0, 0.7));
  backdrop-filter: blur(6px);
}

.sd-frame {
  position: relative;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  width: min(760px, 96vw);
  padding: 28px;
  border-radius: 16px;
  background: var(--panel);
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
  box-shadow: 0 24px 80px -20px var(--glow);
  color: color-mix(in srgb, var(--accent) 92%, #fff);
}

.sd-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  color: var(--accent);
  font-size: 18px;
}

.sd-kicker {
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--accent2);
}

.sd-wordmark {
  margin-top: 6px;
  font-family: var(--title-font, inherit);
  font-size: 40px;
  line-height: 1.05;
  color: var(--accent);
}

.sd-blurb {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.sd-section {
  margin-bottom: 22px;
}

.sd-label {
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: var(--accent2);
}

.sd-stepper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.sd-step-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  color: var(--accent);
}

.sd-step-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.sd-step-val {
  font-size: 30px;
  font-weight: 800;
  color: var(--accent);
}

.sd-step-unit {
  font-size: 12px;
  margin-left: 6px;
  opacity: 0.6;
}

.sd-names {
  display: grid;
  gap: 8px;
}

.sd-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sd-name-idx {
  width: 22px;
  text-align: center;
  opacity: 0.6;
}

.sd-name input,
.sd-win {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  color: inherit;
  font-size: 15px;
}

.sd-winrow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sd-win {
  width: 84px;
  flex: 0 0 auto;
}

.sd-win-sub {
  font-size: 13px;
  opacity: 0.7;
}

.sd-slider {
  flex: 1;
  accent-color: var(--accent);
}

.sd-start {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  background: var(--accent);
  border: none;
  box-shadow: 0 0 28px -6px var(--accent);
}

.sd-start:disabled {
  opacity: 0.45;
  cursor: default;
  box-shadow: none;
}
```

- [ ] **Step 7: Run the deck tests + typecheck**

Run: `npm run test -- deck/`
Expected: PASS (staticDeck + makeDeckPlay tests).

Run: `npm run build`
Expected: typecheck + build succeed.

- [ ] **Step 8: Commit**

```bash
git add src/ui/game/deck/makeDeckPlay.tsx src/ui/game/deck/makeDeckPlay.test.tsx src/ui/game/deck/TypographicMystery.tsx src/ui/game/deck/static-play.css src/ui/game/deck/StaticDeckSetup.tsx src/ui/game/deck/static-setup.css
git commit -m "feat: shared deck-driven play, typographic mystery, generic setup"
```

---

## Task 4: Star Wars game module (theme, skin, FanCard, deck)

**Files:**

- Create: `src/games/starwars/deck.json`
- Create: `src/games/starwars/StarWarsCard.tsx`
- Create: `src/games/starwars/skin.css`
- Create: `src/games/starwars/index.ts`
- Create: `src/games/starwars/deck.data.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/games/starwars/deck.data.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import deck from './deck.json'

type Card = {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  place: string
  description: string
}
const cards = deck.cards as Card[]

describe('starwars deck.json', () => {
  it('has at least 10 cards', () => {
    expect(cards.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every card the required fields', () => {
    for (const c of cards) {
      expect(typeof c.slug).toBe('string')
      expect(typeof c.year).toBe('number')
      expect(c.yearLabel.length).toBeGreaterThan(0)
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    }
  })

  it('has unique slugs', () => {
    const slugs = cards.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('is stored in strictly increasing year order (no ties)', () => {
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].year).toBeGreaterThan(cards[i - 1].year)
    }
  })

  it('labels BBY for negative years and ABY for non-negative', () => {
    for (const c of cards) {
      expect(c.yearLabel).toMatch(c.year < 0 ? /BBY$/ : /ABY$/)
    }
  })

  it('never leaks the BBY/ABY answer in the clue', () => {
    for (const c of cards) {
      expect(c.description).not.toMatch(/BBY|ABY/)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- starwars/deck.data`
Expected: FAIL — `Cannot find module './deck.json'`.

- [ ] **Step 3: Write the deck**

Create `src/games/starwars/deck.json`:

```json
{
  "$comment": "Chrono Star Wars deck. In-universe events on the BBY/ABY axis (year 0 = Battle of Yavin). 'year' is the signed numeric sort key (BBY negative, ABY non-negative); 'yearLabel' is shown on reveal and timeline. 'description' is the guess clue and never states the BBY/ABY value. Typographic cards: no images.",
  "cards": [
    {
      "n": 1,
      "slug": "great-hyperspace-disaster",
      "year": -232,
      "yearLabel": "232 BBY",
      "title": "The Great Hyperspace Disaster",
      "era": "The High Republic",
      "place": "Hetzal system",
      "description": "A catastrophic hyperspace accident scatters deadly wreckage across a system at the height of the High Republic, and the Jedi race to save it."
    },
    {
      "n": 2,
      "slug": "invasion-of-naboo",
      "year": -32,
      "yearLabel": "32 BBY",
      "title": "Invasion of Naboo",
      "era": "Fall of the Republic",
      "place": "Naboo",
      "description": "The Trade Federation blockades and occupies a peaceful world, drawing a young slave boy from Tatooine into the fate of the galaxy."
    },
    {
      "n": 3,
      "slug": "clone-wars-begin",
      "year": -22,
      "yearLabel": "22 BBY",
      "title": "The Clone Wars Begin",
      "era": "Clone Wars",
      "place": "Geonosis",
      "description": "Clone troopers and Jedi storm a desert world to face the Separatist droid army, igniting a galaxy-wide war."
    },
    {
      "n": 4,
      "slug": "order-66",
      "year": -19,
      "yearLabel": "19 BBY",
      "title": "Order 66 and the Empire's Rise",
      "era": "Age of the Empire",
      "place": "Coruscant",
      "description": "The Supreme Chancellor turns the clone army on the Jedi, who are betrayed and all but destroyed as the Republic becomes an Empire."
    },
    {
      "n": 5,
      "slug": "liberation-of-lothal",
      "year": -1,
      "yearLabel": "1 BBY",
      "title": "Liberation of Lothal",
      "era": "Age of Rebellion",
      "place": "Lothal",
      "description": "Rebel cells drive the Empire off a backwater world in one of the rebellion's first true victories."
    },
    {
      "n": 6,
      "slug": "battle-of-yavin",
      "year": 0,
      "yearLabel": "0 ABY",
      "title": "Battle of Yavin",
      "era": "Age of Rebellion",
      "place": "Yavin 4",
      "description": "A farm boy turned pilot destroys the Empire's planet-killing battle station with a single proton-torpedo shot."
    },
    {
      "n": 7,
      "slug": "battle-of-hoth",
      "year": 3,
      "yearLabel": "3 ABY",
      "title": "Battle of Hoth",
      "era": "Age of Rebellion",
      "place": "Hoth",
      "description": "Imperial walkers assault a hidden Rebel base dug into the ice of a frozen world."
    },
    {
      "n": 8,
      "slug": "battle-of-endor",
      "year": 4,
      "yearLabel": "4 ABY",
      "title": "Battle of Endor",
      "era": "Age of Rebellion",
      "place": "Endor",
      "description": "The Rebels destroy a second, unfinished battle station above a forest moon, and the Emperor is thrown down."
    },
    {
      "n": 9,
      "slug": "the-mandalorian-and-grogu",
      "year": 9,
      "yearLabel": "9 ABY",
      "title": "A Mandalorian and the Child",
      "era": "The New Republic",
      "place": "Nevarro",
      "description": "A lone bounty hunter in beskar armor takes in a mysterious Force-sensitive child as the young New Republic struggles to hold order."
    },
    {
      "n": 10,
      "slug": "battle-of-exegol",
      "year": 35,
      "yearLabel": "35 ABY",
      "title": "Battle of Exegol",
      "era": "Rise of the First Order",
      "place": "Exegol",
      "description": "The Resistance and a hidden fleet of resurrected Sith warships clash above a dark, uncharted world in a final reckoning."
    }
  ]
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- starwars/deck.data`
Expected: PASS (6 tests).

- [ ] **Step 5: Write the menu FanCard**

Create `src/games/starwars/StarWarsCard.tsx`:

```tsx
import './skin.css'

/** Star Wars decorative menu card: typographic, crawl-yellow on a starfield.
 *  No imagery (sidesteps the IP concern); titles cycle through a few events. */
const SAMPLE = [
  { label: '0 ABY', title: 'Battle of Yavin' },
  { label: '19 BBY', title: 'Order 66' },
  { label: '4 ABY', title: 'Battle of Endor' },
  { label: '32 BBY', title: 'Invasion of Naboo' },
]

export function FanCard({ index }: { index: number }) {
  const ev = SAMPLE[index % SAMPLE.length]
  return (
    <div className="h-card sw-card">
      <div className="sw-stars" aria-hidden="true" />
      <span className="sw-year">{ev.label}</span>
      <b className="sw-title">{ev.title}</b>
      <span className="sw-rule" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 6: Write the skin CSS**

Create `src/games/starwars/skin.css`:

```css
/* Star Wars skin: deep-space black + crawl-yellow. Scoped under .skin-starwars.
 * All CSS is bundled globally, so every rule stays skin-scoped. */
.skin-starwars .sw-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px;
  overflow: hidden;
  background: #05060a;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  color: var(--accent);
}

.skin-starwars .sw-stars {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1px 1px at 20% 30%, #fff, transparent),
    radial-gradient(1px 1px at 70% 20%, #cfe3ff, transparent),
    radial-gradient(1px 1px at 40% 70%, #fff, transparent),
    radial-gradient(1px 1px at 85% 60%, #fff, transparent),
    radial-gradient(1px 1px at 55% 85%, #bcd4ff, transparent), #05060a;
  opacity: 0.8;
}

.skin-starwars .sw-year,
.skin-starwars .sw-title,
.skin-starwars .sw-rule {
  position: relative;
  z-index: 1;
}

.skin-starwars .sw-year {
  font-size: 13px;
  letter-spacing: 3px;
  font-weight: 800;
  color: color-mix(in srgb, var(--accent) 80%, #fff);
}

.skin-starwars .sw-title {
  font-family: var(--title-font, inherit);
  font-size: 22px;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--accent);
  text-shadow: 0 0 18px var(--glow);
}

.skin-starwars .sw-rule {
  height: 2px;
  width: 60%;
  background: linear-gradient(90deg, var(--accent), transparent);
}

/* the reveal cover melts to crawl-yellow rather than Hitster purple */
.skin-starwars .reveal-back {
  background: linear-gradient(160deg, #11121a, #05060a);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
}
```

- [ ] **Step 7: Write the module**

Create `src/games/starwars/index.ts`:

```ts
import type { GameModule } from '../types'
import { FanCard } from './StarWarsCard'
import './skin.css'

/**
 * Star Wars game module. A specialized timeline deck riding the shared
 * deck-driven engine. Deep-space crawl vibe (crawl-yellow on black). Events are
 * placed on the in-universe BBY/ABY axis. We do not ship the trademarked Star
 * Wars typeface; the wordmark uses a free condensed stack.
 */
export const starwars: GameModule = {
  id: 'starwars',
  name: 'Star Wars',
  description: 'Place the galaxy’s events on the timeline, from BBY to ABY.',
  playable: true,
  theme: {
    title: 'Star Wars',
    tagline: 'A long time ago... place it on the line.',
    titleFont:
      "'Arial Narrow', 'Franklin Gothic Medium', 'Helvetica Neue', sans-serif",
    palette: {
      bg: '#05060a',
      panel: '#0b0e16',
      accent: '#ffe81f',
      accent2: '#5fa8ff',
      glow: 'rgba(255, 232, 31, 0.18)',
      ink: '#0a0a04',
    },
    skinClass: 'skin-starwars',
    FanCard,
  },
}
```

- [ ] **Step 8: Run the data test + typecheck**

Run: `npm run test -- starwars/deck.data`
Expected: PASS.

Run: `npm run build`
Expected: typecheck + build succeed.

- [ ] **Step 9: Commit**

```bash
git add src/games/starwars/
git commit -m "feat: add Star Wars game module (theme, skin, FanCard, deck)"
```

---

## Task 5: Star Wars play wiring + register + App adapter map + e2e

**Files:**

- Create: `src/ui/game/starwars/deck.ts`
- Create: `src/ui/game/starwars/play.tsx`
- Modify: `src/games/index.ts`
- Modify: `src/ui/App.tsx`
- Create: `e2e/starwars.spec.ts`

- [ ] **Step 1: Write the Star Wars deck loader**

Create `src/ui/game/starwars/deck.ts`:

```ts
import rawDeck from '@/games/starwars/deck.json'
import type { DrawnCard } from '@/core'

interface StarWarsCardData {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  description: string
}

export const CARDS = rawDeck.cards as StarWarsCardData[]

/** Slug -> guess clue shown on the mystery card. */
export const clueBySlug = new Map(
  CARDS.map((c) => [c.slug, c.description] as const),
)

/** Map a raw Star Wars card to the engine's DrawnCard. `year` is the signed sort
 *  key (BBY negative); `yearLabel` ("32 BBY", "0 ABY") drives the display. */
export function toDrawn(c: StarWarsCardData): DrawnCard {
  return {
    card: { id: c.slug, year: c.year },
    reveal: {
      title: c.title,
      subtitle: c.era,
      year: c.year,
      yearLabel: c.yearLabel,
    },
  }
}
```

- [ ] **Step 2: Write the play adapter**

Create `src/ui/game/starwars/play.tsx`:

```tsx
import { makeDeckPlay } from '../deck/makeDeckPlay'
import { makeTypographicMystery } from '../deck/TypographicMystery'
import StaticDeckSetup from '../deck/StaticDeckSetup'
import { CARDS, clueBySlug, toDrawn } from './deck'

/** Star Wars play adapter: a static shuffled deck, a typographic clue mystery,
 *  a text reveal (no image), and the generic static-deck setup. */
export function makeStarWarsPlay() {
  return makeDeckPlay({
    cards: CARDS,
    toDrawn,
    Mystery: makeTypographicMystery(clueBySlug, 'When did it happen?'),
    Setup: StaticDeckSetup,
  })
}
```

- [ ] **Step 3: Register the module**

In `src/games/index.ts`, import and register Star Wars:

```ts
import { registerGame } from './registry'
import { hitster } from './hitster'
import { history } from './history'
import { starwars } from './starwars'

/** Register every built-in game. Import this once at app startup. */
export function registerBuiltInGames(): void {
  registerGame(hitster)
  registerGame(history)
  registerGame(starwars)
}

export { listGames, getGame, registerGame, resetRegistry } from './registry'
export type { GameModule } from './types'
```

- [ ] **Step 4: Wire the adapter in `App.tsx`**

In `src/ui/App.tsx`, add the import (next to the other play imports, ~8):

```tsx
import { makeStarWarsPlay } from './game/starwars/play'
```

Replace the `computedPlay` body (the `game.id === 'history' ? ... : ...` ternary, ~45-57) with a small map keyed by `game.id`, keeping the same deps and eslint-disable:

```tsx
const computedPlay = useMemo(
  () => {
    if (game.id === 'history') return makeHistoryPlay()
    if (game.id === 'starwars') return makeStarWarsPlay()
    return makeHitsterPlay(session)
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [
    game.id,
    session.mock,
    guest,
    session.loggedIn,
    session.connected,
    session.error,
  ],
)
```

- [ ] **Step 5: Run unit tests + lint + build**

Run: `npm run test`
Expected: PASS (all suites, including the new staticDeck/makeDeckPlay/HandCard/starwars-deck tests).

Run: `npm run lint`
Expected: clean.

Run: `npm run build`
Expected: typecheck + build succeed.

- [ ] **Step 6: Write the e2e smoke test**

Create `e2e/starwars.spec.ts` (mirrors `e2e/history.spec.ts`; also asserts the reveal shows a BBY/ABY label, proving Task 2's `yearLabel` plumbing end to end):

```ts
// e2e/starwars.spec.ts
import { expect, test } from '@playwright/test'

// Star Wars is silent and uses a static, shuffled deck (no Spotify, no ?mock=1).
// Smoke playthrough: open Star Wars, start a 2-player game, confirm the clue card
// + hand render, a placement opens the reveal, and the reveal shows a BBY/ABY label.
test('Star Wars plays a clue card and reveals a BBY/ABY label', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByTestId('menu-choose-game').click()
  await page.getByTestId('game-option-starwars').click()
  await expect(page.getByTestId('menu-play')).toBeEnabled()
  await page.getByTestId('menu-play').click()

  // Generic static-deck setup: 2 players (default), name them, then START.
  await page.getByTestId('name-0').fill('Luke')
  await page.getByTestId('name-1').fill('Leia')
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // The game screen shows the typographic clue card and the player's hand.
  await expect(page.locator('.sd-myst')).toBeVisible()
  const handCard = page.getByTestId('hand-card-0')
  await expect(handCard).toBeVisible()

  // Place the card: pick it, drop it after the anchor -> reveal overlay.
  await handCard.click()
  await page.getByTestId('place-after').click()
  const reveal = page.getByTestId('reveal')
  await expect(reveal).toBeVisible()
  // The revealed year is a BBY/ABY label, not a raw number.
  await expect(reveal.locator('.reveal-c-year')).toContainText(/BBY|ABY/)
})
```

- [ ] **Step 7: Run the e2e**

Run: `npm run test:e2e -- starwars`
Expected: PASS. If the dev server is not already running, the Playwright config auto-starts it.

- [ ] **Step 8: Full verification loop**

Run: `npm run lint && npm run test && npm run build && npm run test:e2e`
Expected: all green (History + Star Wars e2e both pass).

- [ ] **Step 9: Commit**

```bash
git add src/ui/game/starwars/ src/games/index.ts src/ui/App.tsx e2e/starwars.spec.ts
git commit -m "feat: wire Star Wars into the registry, app shell, and e2e"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**

- Own themed module + shared adapter → Tasks 3, 4, 5. ✓
- BBY/ABY on signed `year` + `yearLabel` display → Task 2 (plumbing) + Task 4 (data). ✓
- Typographic cards (no `revealImage`) → Task 3 (TypographicMystery) + Task 5 (play omits `revealImage`). ✓
- Title "Star Wars" → Task 4 module. ✓
- Share helper, History UI bespoke → Task 1 refactors only History's pure deck loader; setup/mystery/skin untouched. ✓
- ~10 events spanning High Republic → sequels → Task 4 deck.json. ✓
- Tests (unit + e2e) → Tasks 1-5. ✓
- Out-of-scope honored: no History setup migration; no date axis; no SW tags; deck stays ~10. The stale `toBe(100)` test is fixed in Task 1 Step 6 because that exact file is touched by the refactor (kept in-scope so the suite is green). ✓

**Placeholder scan:** none — every code/CSS/JSON block is complete.

**Type consistency:** `makeStaticDeck`, `makeDeckPlay`/`DeckPlayConfig`, `makeTypographicMystery(clueById, kicker)`, `StaticDeckSetup`, `CardReveal.yearLabel?`, `labelOf?: (id: string) => string | undefined`, and `HandCard.year: number | string` are used identically across tasks. The Star Wars `toDrawn` and History `toDrawn` both set `reveal.yearLabel`. ✓
