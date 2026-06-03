# Minimal game loop (Hitster, single-device): design

Date: 2026-06-03
Status: approved (pending spec review)
Phase: 1, Slice 2

## Context

Phase 1 Slice 1 (the playback + scan spike) is merged to `main`. Spotify login
(PKCE), full playlist import (web-player GraphQL scraper), in-browser playback
(Web Playback SDK), and per-track release-year lookup all work and live as
reusable modules: `src/spotify/`, `src/audio/`, `src/scan/`.

The actual game does not exist yet. `src/core/` has only the placement primitive
(`isPlacementCorrect`, `insertAt`) and `Card {id, year}` / `CardReveal`. This
slice builds the minimal playable game on top of the proven modules.

## Goal

A minimal, playable single-device pass-and-play timeline game (Hitster rules)
that proves the full game flow end to end. The bar is "a working, playable flow",
not visual polish.

## Non-goals (this slice)

- Polished or styled UI. The UI is plain and functional only; visual design is a
  later slice.
- Optional rules: artist/title bonus guesses, tokens, stealing. The engine is
  built to accept these later; none are implemented now.
- QR scanning / physical cards. The digital game draws songs from the deck
  automatically; scanning belongs to the future physical-card mode (Phase 3).
- Online multiplayer / cross-device sync.
- Release-year accuracy refinement. We reuse the spike's year lookup; the
  reissue/compilation-year caveat still stands and is later work.

## Rules

- 2 to 6 players; each enters a name at setup.
- The host imports a Spotify playlist (link or the "my playlists" picker, both
  reused) to form the shuffled deck for the game.
- Target to win: default 10 cards, host-adjustable at setup.
- Each player starts with one **anchor card** placed on their own timeline, with
  its year shown.
- A turn:
  1. A new song from the deck plays for the current player with all information
     hidden (no name, no artist, no year).
  2. The player taps the gap on their own timeline where they think it belongs by
     year (Option A: tap the empty space).
  3. The song reveals openly (title, artist, year). Correct placement keeps the
     card on the player's timeline; wrong placement discards it.
  4. The next player gets a new song.
- The first player to reach the target number of cards wins.
- No results-hiding or device-handoff ceremony. Unlimited pause/replay. No timer.

## Architecture (Approach A)

A pure, framework-agnostic engine in `src/core/`; a plain React UI in
`src/ui/game/`; all Spotify work via the proven `src/spotify/` modules. The
engine does no I/O. The UI adapter handles async work (deck draws, year fetches,
playback) and feeds the pure engine fully-formed cards.

```
src/core/game.ts          engine: GameState + pure transitions   (+ game.test.ts)
src/core/timeline.ts      existing isPlacementCorrect / insertAt (reused)
src/ui/game/
  GameContainer.tsx        holds engine state (useReducer), routes by status/phase
  SetupScreen.tsx          player names, target, import playlist
  TurnScreen.tsx           approved layout: hidden song + own timeline + tap-gap
  RevealPanel.tsx          title/artist/year + correct/wrong + Next
  WinScreen.tsx            winner + standings + play again
  deck.ts                  tracks -> shuffled deck; draw; fetch a card's reveal/year
  useGame.ts               reducer wrapping the pure transitions
```

Reused as-is: `src/spotify` (login, import, `SpotifyProvider`, `/api/track-year`).
Not used here: `src/scan` (QR).

## Engine (`src/core/game.ts`, pure)

Data shapes, designed to grow:

```ts
GameConfig  { targetCards: number }                 // future optional-rule flags live here
Player      { id: string; name: string; timeline: Card[] }   // future: tokens
DrawnCard   { card: Card; reveal: CardReveal }       // the song's card + its answer
TurnOutcome { correct: boolean }                     // future: bonus fields
Phase       = 'listening' | 'revealed'               // future phases insert here
Status      = 'playing' | 'won'
GameState   {
  players: Player[]
  drawn: DrawnCard | null
  currentPlayerIndex: number
  phase: Phase
  status: Status
  config: GameConfig
  winnerId?: string
  lastOutcome?: TurnOutcome
}
```

The engine holds game state only. The **deck lives in the UI** (it needs async
year fetches), so the engine receives already-resolved cards as arguments.

Pure transitions:

- `startGame(config, players, anchors, firstDrawn)` where `players` is
  `{id,name}[]`, `anchors` is one `Card` per player (years already fetched), and
  `firstDrawn` is the first `DrawnCard`. Returns a `GameState` with each player's
  timeline seeded by their anchor, `currentPlayerIndex = 0`, phase `listening`,
  status `playing`.
- `placeCard(state, slotIndex)`: allowed only in `listening`. Validates with
  `isPlacementCorrect(currentPlayer.timeline, drawn.card, slotIndex)`. Correct:
  `insertAt` the card into the current player's timeline (kept ascending by year).
  Wrong: discard. Sets `phase = 'revealed'` and `lastOutcome = { correct }`.
- `advanceTurn(state, nextDrawn)`: allowed only in `revealed`. If the current
  player's timeline length has reached `config.targetCards`, set `status = 'won'`
  and `winnerId`. Else if `nextDrawn` is null (deck exhausted), set `status =
'won'` with the leader (most cards) as winner. Otherwise move to the next
  player, set `drawn = nextDrawn`, `phase = 'listening'`.
- Selectors: `currentPlayer(state)`, `isWon(state)`, `standings(state)` (players
  sorted by card count).

Extensibility seams (so optional rules are additive, not a rewrite):

1. Explicit `Phase` enum; a future `'bonus-guess'` step inserts as a new phase.
2. `TurnOutcome` and scoring are data; bonuses add fields/awards.
3. `GameConfig` carries feature flags; the base game leaves them off.
4. Placement-correctness (`timeline.ts`) stays separate from applying the outcome,
   so extra scoring layers compose.

## UI + deck (`src/ui/game/`)

- `deck.ts`:
  - `buildDeck(tracks, rng)`: shuffle imported tracks (injectable RNG for tests)
    into a draw order. Holds remaining tracks.
  - `drawReveal(track, fetchYear)`: fetch the track's year (via `/api/track-year`,
    injected for tests) and return a `DrawnCard` `{ card: {id, year}, reveal:
{title, artist, year} }`. If the year cannot be fetched, the caller skips the
    track and draws the next.
- `useGame.ts`: a `useReducer` whose actions wrap the pure transitions; the
  container performs the async draw/fetch then dispatches.
- Flow:
  - Setup: import playlist -> build deck -> draw one anchor per player + fetch
    each year, draw the first song + fetch its year (hidden) -> `startGame`.
  - Turn: play `drawn.card`'s uri via `SpotifyProvider` (hidden). Tap a gap ->
    `placeCard(slot)` -> reveal. `Next` -> draw + fetch next -> `advanceTurn`.
  - Years are fetched lazily, one per turn (plus the few anchors at setup), never
    the whole playlist up front, and stay hidden until reveal.

The host must be logged in and the player connected before a game can start
(reusing the spike's login/connect UI inside `SetupScreen`).

## Error handling

- A drawn card whose year cannot be fetched is skipped; draw the next. Same for
  anchors at setup. The deck effectively yields only year-resolvable cards.
- Deck exhaustion (unlikely with large playlists and first-to-10): end the game
  and declare the leader, via `advanceTurn(state, null)`.
- Login / import / playback errors reuse the spike's existing handling; setup
  blocks "Start game" until logged in + connected.
- Engine guards: out-of-range slot index, acting in the wrong phase, and placing
  with no drawn card are rejected as no-ops in the pure transitions.

## Testing

- **Engine unit tests (Vitest), exhaustive** (the heart of the suite):
  `startGame` seeds anchors + first draw; `placeCard` keeps on correct / discards
  on wrong and sets `lastOutcome`; `advanceTurn` rotates players, detects the win
  at target, ends on deck exhaustion; phase guards; selectors and standings.
- **`deck.ts`**: deterministic shuffle with an injected RNG; track -> Card
  mapping; `drawReveal` with an injected fetch (incl. the year-missing skip path).
- **E2E (Playwright), the flow proof**: a happy path with a mock deck + mock
  provider (the spike's `?mock=1` pattern, no real Spotify) that sets up 2
  players, plays several turns (mix of correct/wrong), and reaches a win screen.
- **Manual**: one real play-through with a real imported playlist.

## Definition of done

- A host can set up 2 to 6 named players, a target, and an imported playlist,
  then play complete turns until someone wins, on one device.
- Engine unit tests + `deck.ts` tests + the mock-path E2E pass; `lint`, `test`,
  and `build` are green.
- Verified by one manual real-playlist play-through.

## Future (informs structure, not built now)

- Optional rules via the engine seams: artist/title bonus guesses first, then
  tokens / stealing.
- Polished, designed UI (a dedicated visual slice).
- QR / physical-card mode (Phase 3) reusing `src/scan`.
- The History game (Phase 2), which is when the `GameModule` interface generalises
  to supply decks/reveal/audio per game.
- Release-year accuracy (manual override / MusicBrainz cross-check).
