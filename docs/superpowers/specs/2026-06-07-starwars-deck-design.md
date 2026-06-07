# Star Wars Deck + Shared Deck-Driven Engine — Design

**Date:** 2026-06-07
**Status:** Approved design, pending spec review

## Goal

Add **Star Wars** as the first _specialized_ timeline game in Chrono, and in doing
so extract a reusable, deck-driven pattern so future specials (Sports, WW2, ...)
are "drop in a deck + a theme," not "write a new game."

Specialized timelines are **their own themed game modules** (own menu tile, own
look), but they all run on **one shared static-deck adapter**, so the engine,
turn logic, reveal, and win flow are identical across every timeline game. This
keeps the core History deck from being inflated with off-topic cards and lets
each special carry its own theme and axis.

## Decisions (locked during brainstorming)

| Question      | Decision                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure     | Each special is its **own registered `GameModule`** with its own theme; all share one generic deck-driven adapter.                                |
| First special | **Star Wars.**                                                                                                                                    |
| Deck content  | **In-universe events, all canon** (films + TV).                                                                                                   |
| Axis          | **BBY/ABY** mapped onto the existing signed numeric `year` (BBY negative, ABY positive, Battle of Yavin = 0). No engine change.                   |
| Card art      | **Typographic / opening-crawl style.** No images, no art pipeline, sidesteps the Star Wars IP concern.                                            |
| Menu title    | **"Star Wars"** (private game; trademark exposure only matters if ever made public).                                                              |
| History reuse | **Share** the new static-deck helpers (small, test-guarded refactor of History's pure deck loader); History keeps its bespoke setup/mystery/skin. |
| v1 size       | **~10 marquee events** spanning High Republic → sequels; expandable later.                                                                        |

## Architecture

The engine card is `{ id, year }` and orders on `year`. Star Wars needs no new
axis machinery: a BBY year is just a negative number (like BC), an ABY year is
positive, and ascending numeric order is chronological. The display string lives
in the existing `yearLabel` field ("32 BBY", "0 ABY", "35 ABY"), which
`RevealOverlay` already renders. Scoring and placement are unchanged.

`makeHistoryPlay()` today does three things: load a static deck, shuffle/draw it,
and assemble a `GamePlay`. We extract the deck/assembly glue into shared helpers
and let both History and Star Wars use them. Each game still supplies its own
`Mystery`, `Setup`, and (optionally) `revealImage`.

A Star Wars deck supplies **no** `revealImage`, so `RevealOverlay` renders the
title/era/label as text — exactly the typographic treatment we want.

### Shared, new (`src/ui/game/deck/`)

- **`staticDeck.ts`** — `makeStaticDeck(cards, toDrawn, rng): DeckHandle`. The
  Fisher-Yates shuffle + cursor currently inside `history/deck.ts`, generalized
  over a card type and a `card -> DrawnCard` mapper.
- **`makeDeckPlay.tsx`** — `makeDeckPlay(config): GamePlay` where config is
  `{ cards, toDrawn, Mystery, Setup, revealImage? }`. Returns a `GamePlay` whose
  `initDeck` builds a `makeStaticDeck` handle.
- **`StaticDeckSetup.tsx`** + **`static-setup.css`** — a theme-driven
  players+win-target popup. Reads wordmark/tagline from the active game theme;
  structural markup preserves the **load-bearing** data-testids
  (`name-0..5`, `target`, `start-game`, `player-plus`, `player-minus`,
  `setup-close`) so the shared e2e drives every static-deck game identically.
  Skinned per game via `theme.skinClass`. **New code; History is not migrated
  onto it in v1.**
- **`TypographicMystery.tsx`** — generic clue card (kicker + clue text) for
  image-less decks; reads the clue from a passed lookup.

### History refactor (small, test-guarded)

- `src/ui/game/history/deck.ts` keeps its `imageBySlug` / `clueBySlug` maps and
  its `toDrawn`, but its inline `shuffle` + handle are replaced by a call to the
  shared `makeStaticDeck`. `history/play.tsx` may either keep calling
  `makeHistoryDeck` or route through `makeDeckPlay`; the deck unit test
  (`deck.test.ts`) and the History e2e guard this. History's `HistoryMystery`,
  `HistorySetup`, reveal image, and skin are **unchanged**.

### Star Wars module (`src/games/starwars/`)

- **`index.ts`** — `GameModule` `{ id: 'starwars', name: 'Star Wars', playable:
true, theme }`. Theme: crawl-yellow `#FFE81F` accent on near-black bg, a
  starfield glow, a bold condensed display font (a free/system stack — we do not
  ship the trademarked Star Wars typeface), `skinClass: 'skin-starwars'`,
  `FanCard` (see below).
- **`skin.css`** — `skin-starwars` styles: black/starfield panels, crawl-yellow
  ink, subtle perspective on the menu fan.
- **`StarWarsCard.tsx`** — typographic `FanCard` for the menu fan: a small
  starfield card showing an event title in crawl-yellow.
- **`deck.json`** — the v1 events (schema + content below).

### Star Wars wiring (`src/ui/game/starwars/`)

- **`deck.ts`** — load `starwars/deck.json`; build `clueBySlug` and a `toDrawn`
  mapping `card -> { card: { id: slug, year }, reveal: { title, subtitle: era,
year } }`. `RevealOverlay` shows `yearLabel` via the reveal; placement uses
  `year`.
- **`play.tsx`** — `makeStarWarsPlay()` → `makeDeckPlay({ cards, toDrawn,
Mystery: TypographicMystery-bound-to-the-SW-clues, Setup: StaticDeckSetup })`,
  **no** `revealImage`.

### Shell

- **`src/games/index.ts`** — `registerGame(starwars)` in `registerBuiltInGames`.
- **`src/ui/App.tsx`** — replace the binary
  `game.id === 'history' ? makeHistoryPlay() : makeHitsterPlay(session)` with a
  small map keyed by `game.id` (`history → makeHistoryPlay`,
  `starwars → makeStarWarsPlay`, default `→ makeHitsterPlay(session)`), keeping
  the existing freeze-on-START behavior.

## Deck schema (Star Wars)

Lighter than History's (no `scene`, no `have` — those drive image generation):

```jsonc
{
  "n": 6,
  "slug": "battle-of-yavin",
  "year": 0, // signed: BBY negative, ABY positive, Yavin = 0
  "yearLabel": "0 ABY", // shown on reveal
  "title": "Battle of Yavin",
  "era": "Age of Rebellion",
  "place": "Yavin 4",
  "description": "A farm boy turned pilot destroys the Empire's planet-killing battle station with a single proton-torpedo shot.",
}
```

`description` is the guess clue: recognizable, but never states the BBY/ABY year.

## v1 events (10)

Ordered by timeline; chosen for spread (High Republic → sequels) and canon
breadth (films + TV). Years are distinct (no intra-year ties to resolve).

| #   | slug                      | year | yearLabel | title                          | era                     | place         |
| --- | ------------------------- | ---- | --------- | ------------------------------ | ----------------------- | ------------- |
| 1   | great-hyperspace-disaster | -232 | 232 BBY   | The Great Hyperspace Disaster  | The High Republic       | Hetzal system |
| 2   | invasion-of-naboo         | -32  | 32 BBY    | Invasion of Naboo              | Fall of the Republic    | Naboo         |
| 3   | clone-wars-begin          | -22  | 22 BBY    | The Clone Wars Begin           | Clone Wars              | Geonosis      |
| 4   | order-66                  | -19  | 19 BBY    | Order 66 and the Empire's Rise | Age of the Empire       | Coruscant     |
| 5   | liberation-of-lothal      | -1   | 1 BBY     | Liberation of Lothal           | Age of Rebellion        | Lothal        |
| 6   | battle-of-yavin           | 0    | 0 ABY     | Battle of Yavin                | Age of Rebellion        | Yavin 4       |
| 7   | battle-of-hoth            | 3    | 3 ABY     | Battle of Hoth                 | Age of Rebellion        | Hoth          |
| 8   | battle-of-endor           | 4    | 4 ABY     | Battle of Endor                | Age of Rebellion        | Endor         |
| 9   | the-mandalorian-and-grogu | 9    | 9 ABY     | A Mandalorian and the Child    | The New Republic        | Nevarro       |
| 10  | battle-of-exegol          | 35   | 35 ABY    | Battle of Exegol               | Rise of the First Order | Exegol        |

Clues (no year leaked):

1. A catastrophic hyperspace accident scatters deadly wreckage across a system at the height of the High Republic, and the Jedi race to save it.
2. The Trade Federation blockades and occupies a peaceful world, drawing a young slave boy from Tatooine into the fate of the galaxy.
3. Clone troopers and Jedi storm a desert world to face the Separatist droid army, igniting a galaxy-wide war.
4. The Supreme Chancellor turns the clone army on the Jedi, who are betrayed and all but destroyed as the Republic becomes an Empire.
5. Rebel cells drive the Empire off a backwater world in one of the rebellion's first true victories.
6. A farm boy turned pilot destroys the Empire's planet-killing battle station with a single proton-torpedo shot.
7. Imperial walkers assault a hidden Rebel base dug into the ice of a frozen world.
8. The Rebels destroy a second, unfinished battle station above a forest moon, and the Emperor is thrown down.
9. A lone bounty hunter in Mandalorian armor takes in a mysterious Force-sensitive child as the young New Republic struggles to hold order.
10. The Resistance and a hidden fleet of resurrected Sith warships clash above a dark, uncharted world in a final reckoning.

## Testing

- **Unit:** `staticDeck.test.ts` — deterministic shuffle/draw, draws every card
  once, returns `null` when exhausted. `starwars/deck.data.test.ts` — unique
  slugs, numeric `year`, present `yearLabel`, `description` present and contains
  no digit run that matches the year, strictly increasing year order in the file
  (catches data drift).
- **E2E:** `e2e/starwars.spec.ts` mirroring `e2e/history.spec.ts` — start a game
  via the shared testids, place a card, see a reveal. No mock/guest needed (the
  deck is static).
- **Regression:** existing History e2e + `deck.test.ts` must stay green through
  the shared-helper refactor.
- **Verify-before-done:** `npm run lint`, `npm run test`, `npm run build`,
  `npm run test:e2e`.

## Out of scope (v1)

- Migrating History's setup onto `StaticDeckSetup` (deferred; optional later).
- Specific-date (day/month) axis — Star Wars uses year-resolution BBY/ABY; the
  date axis returns when we build WW2.
- Tag filtering for Star Wars (History keeps tags; SW has none in v1).
- Expanding the deck beyond ~10 (a later content pass, as History grew 10 → 200).
- The pre-existing stale `expect(n).toBe(100)` History card-count test (separate
  cleanup, not part of this work).

## Follow-ups this unlocks

Adding the next special (Sports, WW2, Movies) becomes: author a `deck.json`, a
small `GameModule` (theme + FanCard + skin), and a one-line `play.tsx`; register
it; done. WW2 will additionally exercise the specific-date axis.
