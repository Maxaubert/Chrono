# Per-Game Theming (menu) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or executing-plans, task-by-task. Steps use `- [ ]`.

**Goal:** Make the front page a game-agnostic shell that paints itself in the active game's full vibe (title, tagline, palette, type, button/card style). Choosing a game swaps everything; adding a game later = one module + skin + card, no shell edits.

**Architecture:** Extend `GameModule` with a `theme` (palette + skinClass + FanCard + title/tagline) and a `playable` flag. A `ThemeProvider` sets the active game's palette as CSS variables and applies its skin class to the root. `menu.css` splits into a shared **base** (layout) and per-game **skins** (look), each skin scoped under `.skin-<id>` and living with its game. Default game = Hitster (retro-scifi, the current look); History = a natural/stylish placeholder skin (no real engine yet).

**Scope:** menu + cards + theme plumbing. In-game Setup/Turn/Reveal screens keep current styling (reskinned in a later slice). History is theme-only.

---

### Task 1: Theme types + relocate the Hitster card

**Files:** `src/games/types.ts` (extend), `src/games/hitster/index.ts` (add theme), `src/games/hitster/HitsterCard.tsx` (new, from SongCard), `src/games/hitster/HitsterCard.test.tsx`.

- [ ] Extend `types.ts`:

```ts
export interface ThemePalette {
  bg: string
  panel: string
  accent: string
  accent2: string
  glow: string
  ink: string
}
export interface GameTheme {
  title: string
  tagline: string
  palette: ThemePalette
  skinClass: string // e.g. 'skin-hitster'
  FanCard: React.ComponentType<{ index: number }> // decorative i-th card for the menu fan
}
export interface GameModule {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly playable: boolean // has a real engine wired to PLAY
  readonly theme: GameTheme
}
```

- [ ] Move the card from `src/ui/menu/SongCard.tsx` into `HitsterCard.tsx`: keep `SAMPLE_DECK`, export `FanCard({index})` rendering the existing `.card.front` markup (foil/idx/art/info/brand) for `SAMPLE_DECK[index]`. (Card _visuals_ stay in the Hitster skin, Task 3.)
- [ ] Add `theme` + `playable: true` to `hitster`: title 'Hitster', tagline 'Hear it. Place it. Hold the line.', palette (violet: bg #08060f, panel #0e0a1a, accent #9a6bff, accent2 #6b3fd6, glow rgba(154,107,255,.17), ink #0f0820), skinClass 'skin-hitster', FanCard.
- [ ] Test: `hitster.theme.title === 'Hitster'`, `hitster.playable === true`, `render(<hitster.theme.FanCard index={0} />)` shows `SAMPLE_DECK[0].year`.
- [ ] Commit.

---

### Task 2: ThemeProvider + useActiveGame

**Files:** `src/ui/theme/ThemeProvider.tsx` (new), `src/ui/theme/ThemeProvider.test.tsx`.

- [ ] Context holding `activeGameId` (default 'hitster') + `setActiveGameId`; derive active `GameModule` from the registry. `useActiveGame()` returns `{ game, setGame }`.
- [ ] `ThemeProvider` renders a wrapper `<div>` with `className={game.theme.skinClass}` and inline `style` setting `--bg/--panel/--accent/--accent2/--glow/--ink` from `game.theme.palette`; renders children inside.
- [ ] Test: default wrapper has class `skin-hitster` and `--accent: #9a6bff`; after `setGame('history')` it has `skin-history` and the amber accent.
- [ ] Commit.

---

### Task 3: Split menu.css into base + Hitster skin

**Files:** `src/ui/menu/menu-base.css` (new, shared), `src/games/hitster/skin.css` (new), remove `src/ui/menu/menu.css`.

- [ ] `menu-base.css` (`.menu-screen` ...): structural only, consuming `var(--*)`: screen bg/size, split grid, left/hand/fan-slot positions + `.c1..c4` + menuDeal, right column + logo _position_, menu list layout, foot, `.el` stagger, slash _positions_. No game-specific colors/shapes/fonts beyond the vars.
- [ ] `hitster/skin.css` (`.skin-hitster` ...): the retro-scifi look, glitch logo (crt + gA/gB), HUD `.btn` clip-path + states, slash tint, and the full card visuals (card bg/border, idx, art + bars, info, brand, the menuSheen sweep/drift + per-card stagger). Everything scoped under `.skin-hitster`.
- [ ] Import both: `menu-base.css` from MenuScreen; `skin.css` from the hitster module (so it bundles whenever games register).
- [ ] Verify: `npm run build` clean; the menu at `/` looks identical to before. Commit.

---

### Task 4: Generic MenuScreen

**Files:** `src/ui/menu/MenuScreen.tsx` (refactor), `src/ui/menu/MenuScreen.test.tsx` (update).

- [ ] Read `const { game } = useActiveGame()`. Render the logo with `game.theme.title` (data-text + text), `game.theme.tagline`, and the fan as 4 `<div class="fan-slot cN"><game.theme.FanCard index={i} /></div>`.
- [ ] PLAY: `data-testid="menu-play"`; if `game.playable` → `onClick={onPlay}`, else `disabled` + "coming soon". CHOOSE GAME opens the picker (Task 6) — no longer permanently disabled. CREATE/JOIN/SETTINGS stay disabled placeholders.
- [ ] Drop `import './menu.css'`; rely on base + skin (imported as above). The root skin class/vars come from ThemeProvider (Task 7 wraps the app).
- [ ] Tests: shows active game's title; PLAY calls `onPlay` when playable.
- [ ] Commit.

---

### Task 5: History module + skin + card (placeholder)

**Files:** `src/games/history/index.ts`, `src/games/history/HistoryCard.tsx`, `src/games/history/skin.css`, register in `src/games/registry.ts` (or `index.ts`).

- [ ] `history` module: id 'history', name 'History', description, `playable: false`, theme: title 'History', tagline 'When did it happen? Place it on the line.', palette (natural: warm dark bg, sage/olive panel, bronze/amber accent ~#c9933f, cream-ish ink), skinClass 'skin-history', FanCard.
- [ ] `HistoryCard.tsx`: a calmer "museum plaque" card, year corner index + event title/subtitle (sample events), no album art/eq bars.
- [ ] `history/skin.css` (`.skin-history` ...): natural-but-stylish, elegant serif logo (no glitch), soft rounded `.btn`, warm/organic background, gentle card treatment. (May delegate this CSS to a subagent.)
- [ ] Register history so `registry.list()` returns both.
- [ ] Test: registry includes 'history'; `history.playable === false`.
- [ ] Commit.

---

### Task 6: Choose Game picker

**Files:** `src/ui/menu/GamePicker.tsx` (new), wire into `MenuScreen.tsx`, `src/ui/menu/GamePicker.test.tsx`.

- [ ] Overlay listing `registry.list()` (name + tagline + accent swatch); clicking a game calls `setGame(id)` and closes. `data-testid="game-option-<id>"`, trigger `data-testid="menu-choose-game"`.
- [ ] Selecting reskins the menu live (title/colors/cards change via ThemeProvider).
- [ ] Test: open picker, click `game-option-history` → menu title shows 'History'.
- [ ] Commit.

---

### Task 7: Wire app + verification

**Files:** `src/ui/App.tsx`, `e2e/game.spec.ts` (check), `e2e/smoke.spec.ts` (check).

- [ ] Wrap the menu (and game) render in `<ThemeProvider>` so skin class + vars apply.
- [ ] E2E: default is Hitster, `menu-play` → game still passes (add a Choose-Game e2e optionally).
- [ ] Full: `npm run lint && npm run test && npm run build && npm run test:e2e`, all green.
- [ ] Commit.

---

## Self-Review

- **Coverage:** theme model (T1), provider/vars (T2), base+skin split (T3), generic menu (T4), second game vibe (T5), swap UI (T6), wiring/verify (T7).
- **Out of scope:** real History gameplay; reskinning in-game screens; persisting the chosen game.
- **Type consistency:** `GameTheme`/`ThemePalette`/`playable` used identically T1-T6; `useActiveGame()` returns `{ game, setGame }` across T2/T4/T6; skin classes `skin-hitster`/`skin-history` match between modules (T1/T5) and CSS (T3/T5).
