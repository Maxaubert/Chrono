# Generalize the Play Loop — Implementation Plan (PR 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a `GamePlay` adapter and make Hitster the first implementer, so the single-device play loop is game-agnostic — with **zero behavior change** and all existing tests green.

**Architecture:** `src/core/` is already game-neutral and stays untouched. The Hitster-specific bits (deck building, audio playback, the mystery card, setup) move behind a `GamePlay` adapter built at runtime from the `SpotifySession`. `GameContainer` and `GameScreen` become adapter-driven. This is a pure refactor; the existing Hitster unit + Playwright suites are the safety net. PR 2 adds the History adapter on top.

**Tech Stack:** React 19 + TypeScript + Vite, Vitest (+ Testing Library, jsdom), Playwright. `@/` aliases `src/`.

**Spec:** `docs/superpowers/specs/2026-06-05-history-game-design.md`

**Baseline before starting:** run `npm run lint && npm run test && npm run build` and confirm green. Record that the Hitster Playwright flow passes: `npm run test:e2e`. Everything below must keep all of these green.

---

### Task 1: Define the `GamePlay` adapter types

**Files:**
- Create: `src/ui/game/play/adapter.ts`

- [ ] **Step 1: Write the adapter module (types only, no runtime code)**

```ts
// src/ui/game/play/adapter.ts
import type { ComponentType } from 'react'
import type { DrawnCard } from '@/core'

/** Pops cards from a game's shuffled deck one at a time. Async because some
 *  games (Hitster) resolve a year per card and may skip unusable cards. */
export interface DeckHandle {
  next(): Promise<DrawnCard | null>
}

/** What the generic mystery slot passes to a game's mystery card. */
export interface MysteryProps {
  drawn: DrawnCard | null
  isPlaying: boolean
  /** Guest mode (Hitster QR). Games that ignore it just don't read it. */
  qr?: boolean
  onPause: () => void
  onResume: () => void
  onReplay: () => void
}

/** Optional playback hooks. Omit the whole object for a silent game (History). */
export interface GameAudio {
  onDraw: (drawn: DrawnCard) => void
  onPause: () => void
  onResume: () => void
  onReplay: (drawn: DrawnCard) => void
  onStop: () => void
}

export interface GameSetupResult {
  names: string[]
  targetCards: number
}

export interface GameSetupProps {
  onStart: (result: GameSetupResult) => void
  onClose?: () => void
}

/** Everything a game supplies to become playable on the shared loop. */
export interface GamePlay {
  /** Build the shuffled draw pile from setup; return a handle to pop cards. */
  initDeck: (
    result: GameSetupResult,
    rng: () => number,
  ) => Promise<DeckHandle> | DeckHandle
  /** Rendered in the mystery slot for the current drawn card. */
  Mystery: ComponentType<MysteryProps>
  /** Image shown on the reveal; RevealOverlay renders title/subtitle/year. */
  revealImage?: (drawn: DrawnCard) => string | undefined
  /** Omit for a silent game. */
  audio?: GameAudio
  /** Collects names + win target (+ any game payload) and calls onStart. */
  Setup: ComponentType<GameSetupProps>
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS (no type errors; nothing imports the module yet).

- [ ] **Step 3: Commit**

```bash
git add src/ui/game/play/adapter.ts
git commit -m "feat(play): add GamePlay adapter interface"
```

---

### Task 2: Extract Hitster's deck into a `DeckHandle`

The current deck logic lives in `src/ui/game/deck.ts` (`buildDeck`, `takeNextDrawn`) and is wired together inside `GameContainer.start`. Wrap it as a `DeckHandle` factory so the container no longer knows about Spotify.

**Files:**
- Create: `src/ui/game/hitster/deckSource.ts`
- Test: `src/ui/game/hitster/deckSource.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/game/hitster/deckSource.test.ts
import { describe, expect, it } from 'vitest'
import type { SpotifyTrack } from '@/spotify'
import { makeHitsterDeck } from './deckSource'

const track = (id: string, year: number): SpotifyTrack => ({
  id,
  uri: `spotify:track:${id}`,
  title: `T-${id}`,
  artist: `A-${id}`,
  year,
  image: null,
})

describe('makeHitsterDeck', () => {
  it('pops DrawnCards in shuffled order, resolving each year', async () => {
    const tracks = [track('a', 1990), track('b', 1991), track('c', 1992)]
    const fetchYear = async (id: string) =>
      tracks.find((t) => t.id === id)!.year as number
    // rng returns 0 -> Fisher-Yates is deterministic for the test
    const handle = makeHitsterDeck(tracks, fetchYear, () => 0)
    const first = await handle.next()
    expect(first).not.toBeNull()
    expect(first!.card).toMatchObject({ year: expect.any(Number) })
    expect(first!.reveal.title).toMatch(/^T-/)
  })

  it('skips tracks whose year cannot be resolved', async () => {
    const tracks = [track('a', 1990), track('b', 1991)]
    const fetchYear = async (id: string) => (id === 'a' ? null : 1991)
    const handle = makeHitsterDeck(tracks, fetchYear, () => 0)
    const drawn = await handle.next()
    expect(drawn!.card.id).toBe('b')
  })

  it('returns null when the deck is exhausted', async () => {
    const handle = makeHitsterDeck([], async () => null, () => 0)
    expect(await handle.next()).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- src/ui/game/hitster/deckSource.test.ts`
Expected: FAIL ("makeHitsterDeck is not a function" / module not found).

- [ ] **Step 3: Write the implementation (reusing existing deck.ts helpers)**

```ts
// src/ui/game/hitster/deckSource.ts
import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from '../deck'
import type { DeckHandle } from '../play/adapter'

/** A DeckHandle over a shuffled Spotify track list. Pops the next track whose
 *  release year resolves, mapping it to a DrawnCard (the existing behavior,
 *  just lifted out of GameContainer). */
export function makeHitsterDeck(
  tracks: SpotifyTrack[],
  fetchYear: (id: string) => Promise<number | null>,
  rng: () => number,
): DeckHandle {
  let remaining = buildDeck(tracks, rng)
  return {
    async next() {
      const res = await takeNextDrawn(remaining, fetchYear)
      remaining = res.remaining
      return res.drawn
    },
  }
}
```

- [ ] **Step 4: Run the test**

Run: `npm run test -- src/ui/game/hitster/deckSource.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/game/hitster/deckSource.ts src/ui/game/hitster/deckSource.test.ts
git commit -m "refactor(hitster): extract deck source behind DeckHandle"
```

---

### Task 3: Hitster mystery + audio + reveal adapter pieces

Lift Hitster's `MysteryCard` usage, the album-art reveal image, and the Spotify
playback calls into adapter-shaped pieces. The `MysteryCard` component itself is
unchanged; we add a thin wrapper matching `MysteryProps`.

**Files:**
- Create: `src/ui/game/hitster/HitsterMystery.tsx`
- Reference (unchanged): `src/ui/game/play/MysteryCard.tsx`

- [ ] **Step 1: Write the wrapper that adapts MysteryProps to MysteryCard**

```tsx
// src/ui/game/hitster/HitsterMystery.tsx
import MysteryCard from '../play/MysteryCard'
import type { MysteryProps } from '../play/adapter'

/** Hitster's mystery slot: the existing audio play/pause (or QR) card. */
export default function HitsterMystery({
  drawn,
  isPlaying,
  qr,
  onPause,
  onResume,
  onReplay,
}: MysteryProps) {
  return (
    <MysteryCard
      trackId={drawn?.card.id}
      isPlaying={isPlaying}
      qr={qr}
      onPause={onPause}
      onResume={onResume}
      onReplay={onReplay}
    />
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/game/hitster/HitsterMystery.tsx
git commit -m "refactor(hitster): wrap MysteryCard as a MysteryProps component"
```

---

### Task 4: Assemble the Hitster `GamePlay` (factory bound to the session)

Hitster's adapter needs the `SpotifySession` (for `fetchYear`, the audio
`provider`, and the existing `SetupScreen`). Provide a factory that returns a
`GamePlay`. The Setup is the existing `SetupScreen` with the session bound and
its `tracks` carried via a module-level handoff the deck reads (kept internal so
`GameSetupResult` stays game-neutral: just `names` + `targetCards`).

**Files:**
- Create: `src/ui/game/hitster/play.tsx`
- Reference (unchanged): `src/ui/game/SetupScreen.tsx`, `src/ui/game/useSpotifySession.ts`

- [ ] **Step 1: Write the factory**

```tsx
// src/ui/game/hitster/play.tsx
import type { DrawnCard } from '@/core'
import type { SpotifyTrack } from '@/spotify'
import SetupScreen, { type SetupResult } from '../SetupScreen'
import type { SpotifySession } from '../useSpotifySession'
import type { GamePlay, GameSetupResult } from '../play/adapter'
import { makeHitsterDeck } from './deckSource'
import HitsterMystery from './HitsterMystery'

/** Build Hitster's play adapter for a given Spotify session. The session
 *  supplies the deck's year lookup, the audio provider, and the setup wizard. */
export function makeHitsterPlay(
  session: SpotifySession,
  rng: () => number = Math.random,
): GamePlay {
  // The Spotify SetupScreen collects names + target + tracks. We stash the
  // chosen tracks here so initDeck can read them while GameSetupResult stays
  // game-neutral (names + targetCards only).
  let pendingTracks: SpotifyTrack[] = []
  const imageById = new Map<string, string | null>()

  function Setup({
    onStart,
    onClose,
  }: {
    onStart: (r: GameSetupResult) => void
    onClose?: () => void
  }) {
    return (
      <SetupScreen
        session={session}
        onClose={onClose}
        onStart={(r: SetupResult) => {
          pendingTracks = r.tracks
          imageById.clear()
          for (const t of r.tracks) imageById.set(t.id, t.image)
          onStart({ names: r.names, targetCards: r.targetCards })
        }}
      />
    )
  }

  return {
    Setup,
    Mystery: HitsterMystery,
    initDeck: () => makeHitsterDeck(pendingTracks, session.fetchYear, rng),
    revealImage: (drawn: DrawnCard) =>
      imageById.get(drawn.card.id) ?? undefined,
    audio: {
      onDraw: (drawn) =>
        session.provider.play({ uri: `spotify:track:${drawn.card.id}` }),
      onPause: () => session.provider.pause(),
      onResume: () => session.provider.resume(),
      onReplay: (drawn) =>
        session.provider.play({ uri: `spotify:track:${drawn.card.id}` }),
      onStop: () => session.provider.stop(),
    },
  }
}
```

Note: `SetupScreen` also handles the guest-login gate (`onGuest`). PR 1 keeps
Hitster's existing App-level guest handling unchanged (Task 6); the factory only
wraps the `onStart` mapping. If `SetupScreen` requires `onGuest`, pass it through
from the factory's caller in Task 6.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/game/hitster/play.tsx
git commit -m "refactor(hitster): assemble GamePlay adapter factory"
```

---

### Task 5: Make `GameScreen` render the game's mystery component

**Files:**
- Modify: `src/ui/game/play/GameScreen.tsx`

- [ ] **Step 1: Replace the hard-coded `MysteryCard` with an injected component**

Change `GameScreen`'s props to receive a `Mystery` component and the `drawn`
card, and render `<Mystery .../>` in place of the inline `<MysteryCard .../>`.
Replace the `<MysteryCard ... trackId={state.drawn?.card.id} />` block with:

```tsx
// imports: remove MysteryCard import; add the adapter type
import type { ComponentType } from 'react'
import type { MysteryProps } from './adapter'
// ...in the props type add:
//   Mystery: ComponentType<MysteryProps>
// ...replace the <MysteryCard .../> element with:
<Mystery
  drawn={state.drawn}
  isPlaying={playing}
  qr={qr}
  onPause={onPause}
  onResume={onResume}
  onReplay={onReplay}
/>
```

Keep every other prop (`onPlace`, `titleOf`, `artistOf`, `imageOf`, `piled`,
`interactive`, `Overview`, `Hand`, `GameBackground`) exactly as-is.

- [ ] **Step 2: Typecheck + existing GameScreen-touching tests**

Run: `npm run build && npm run test`
Expected: PASS (callers updated in Task 6; if a test renders `GameScreen`
directly it must now pass a `Mystery` — update those tests to pass
`HitsterMystery`).

- [ ] **Step 3: Commit**

```bash
git add src/ui/game/play/GameScreen.tsx
git commit -m "refactor(play): GameScreen renders an injected Mystery component"
```

---

### Task 6: Make `GameContainer` adapter-driven; wire `App` to build the adapter

This is the core change. `GameContainer` stops importing Spotify directly and
takes a `play: GamePlay`. The turn choreography (schedule/piling/turn-switch/
deal/win) is unchanged; only the deck/audio/mystery/reveal sources move to the
adapter.

**Files:**
- Modify: `src/ui/game/GameContainer.tsx`
- Modify: `src/ui/App.tsx`
- Test (safety net, unchanged behavior): `src/ui/App.test.tsx` and the
  Playwright flow.

- [ ] **Step 1: Change `GameContainer` to consume the adapter**

Replace the Spotify-specific innards while preserving the choreography:
- Props become `{ play, setupResult, qr, onError? }` where `play: GamePlay` and
  `setupResult: GameSetupResult`.
- Replace `buildDeck`/`takeNextDrawn`/`session.fetchYear` with a `DeckHandle`
  from `await play.initDeck(setupResult, Math.random)`; `drawNext()` becomes
  `deck.next()`.
- Replace `play(\`spotify:track:...\`)` and `session.provider.*` calls with
  `play.audio?.onDraw(drawn)`, `play.audio?.onPause()`, `play.audio?.onResume()`,
  `play.audio?.onReplay(drawn)`, `play.audio?.onStop()`.
- Replace `trackInfo`/`titleOf`/`artistOf`/`imageOf` lookups: derive
  `titleOf`/`artistOf` from `state.drawn.reveal` already available; for placed
  cards keep an `imageOf` map populated from `play.revealImage`. Simplest: build
  a `Map<string,string|undefined>` updated each draw with
  `play.revealImage?.(drawn)`, and pass `imageOf = (id) => map.get(id)`.
- Pass `Mystery={play.Mystery}` to `GameScreen`.
- Pass `image={play.revealImage?.(state.drawn)}` to `RevealOverlay`.

Keep `schedule`, the unmount cleanup, `beginEndTurn`, `switchCovered`,
`switchDone`, the loading/`WinScreen`/error rendering, and all timing constants
exactly as they are.

- [ ] **Step 2: Update `App`/`GameRoot` to build and pass the adapter**

In `src/ui/App.tsx` `GameRoot`:
- Build the adapter for the active game: `const play = useMemo(() => makeHitsterPlay(session), [session])` (import `makeHitsterPlay` and `useActiveGame` if needed; PR 1 only wires Hitster).
- Render `play.Setup` instead of the hard-coded `<SetupScreen session=.../>`, passing `onStart` (sets `setup` + starts the transition) and `onClose`.
- Render `<GameContainer play={play} setupResult={setup} qr={session.guest} />`
  instead of `<GameContainer session=... setup=... />`.
- Preserve the existing guest path: if `SetupScreen` needs `onGuest`, thread it
  through `play.Setup` (extend `GameSetupProps` with an optional `onGuest?` only
  if required by the existing flow; otherwise leave App's guest handling as-is).

- [ ] **Step 3: Run the full suite (the real safety net)**

Run: `npm run lint && npm run test && npm run build`
Expected: PASS. Update any test that constructed `GameContainer` with the old
`{ session, setup }` props to the new `{ play, setupResult }` shape, passing a
`makeHitsterPlay(mockSession)` or a hand-built `GamePlay` stub.

- [ ] **Step 4: Run the Hitster Playwright flow**

Run: `npm run test:e2e`
Expected: PASS — identical Hitster behavior (the proof of no regression). If it
fails, the refactor changed behavior; fix until green before committing.

- [ ] **Step 5: Commit**

```bash
git add src/ui/game/GameContainer.tsx src/ui/App.tsx
git add src/ui/App.test.tsx  # if updated
git commit -m "refactor(play): drive GameContainer through the GamePlay adapter"
```

---

### Task 7: Final verification + PR

**Files:** none (verification only)

- [ ] **Step 1: Full green gate**

Run: `npm run lint && npm run test && npm run build && npm run test:e2e`
Expected: all PASS.

- [ ] **Step 2: Confirm zero behavior change**

Manually (or via the run-app skill) start a Hitster mock game (`?mock=1`): setup
→ place a card → reveal → next player → win. Confirm it plays exactly as before.

- [ ] **Step 3: Open the PR**

```bash
git push -u origin <branch>
gh pr create --title "Generalize the play loop onto a GamePlay adapter" \
  --body "Refactor only, no behavior change. Hitster now implements the GamePlay adapter; GameContainer/GameScreen are game-agnostic. Prepares for the History game (PR 2). Refs the issue. All unit + Playwright tests green."
```

---

## Self-review notes

- **Spec coverage:** §1 adapter (Tasks 1,5,6) ✓; Hitster as first implementer
  (Tasks 2-4,6) ✓; no core changes ✓; RevealOverlay reuse via `image` prop
  (Task 6) ✓; "no behavior change, tests green" gate (Tasks 6-7) ✓. History
  itself, the `skin-history` styles, the deck.json loader, and the shared
  players/target extraction are **PR 2** (separate plan) — intentionally out of
  scope here.
- **Type consistency:** `GamePlay`, `DeckHandle`, `MysteryProps`,
  `GameSetupResult` names are used identically across Tasks 1-6.
- **Known follow-up for PR 2 (not done here):** `HandCard.tsx` hardcodes the
  "HITSTER" brand; History will need a themed/!brand variant.
