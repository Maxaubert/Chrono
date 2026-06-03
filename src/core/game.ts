import type { Card, CardReveal } from './types'
import { insertAt, isPlacementCorrect } from './timeline'

export interface GameConfig {
  /** Cards (including the anchor) needed to win. */
  targetCards: number
}

export interface Player {
  id: string
  name: string
  timeline: Card[]
}

/** The current song's placement card plus its hidden answer. */
export interface DrawnCard {
  card: Card
  reveal: CardReveal
}

export interface TurnOutcome {
  correct: boolean
}

export type Phase = 'listening' | 'revealed'
export type Status = 'playing' | 'won'

export interface GameState {
  players: Player[]
  drawn: DrawnCard | null
  currentPlayerIndex: number
  phase: Phase
  status: Status
  config: GameConfig
  winnerId?: string
  lastOutcome?: TurnOutcome
}

export interface PlayerSeed {
  id: string
  name: string
}

/** Begin a game: each player starts with their anchor card; the first song is drawn. */
export function startGame(
  config: GameConfig,
  players: PlayerSeed[],
  anchors: Card[],
  firstDrawn: DrawnCard,
): GameState {
  return {
    players: players.map((p, i) => ({
      id: p.id,
      name: p.name,
      timeline: [anchors[i]],
    })),
    drawn: firstDrawn,
    currentPlayerIndex: 0,
    phase: 'listening',
    status: 'playing',
    config,
  }
}

/** Place the drawn card at a slot on the current player's timeline, then reveal. */
export function placeCard(state: GameState, slotIndex: number): GameState {
  if (state.phase !== 'listening' || !state.drawn) return state
  const player = state.players[state.currentPlayerIndex]
  const correct = isPlacementCorrect(
    player.timeline,
    state.drawn.card,
    slotIndex,
  )
  const players = state.players.slice()
  if (correct) {
    players[state.currentPlayerIndex] = {
      ...player,
      timeline: insertAt(player.timeline, state.drawn.card, slotIndex),
    }
  }
  return {
    ...state,
    players,
    phase: 'revealed',
    lastOutcome: { correct },
  }
}

function leaderId(players: Player[]): string {
  return players.reduce((best, p) =>
    p.timeline.length > best.timeline.length ? p : best,
  ).id
}

/** After a reveal, check for a win, otherwise pass to the next player with a new song. */
export function advanceTurn(
  state: GameState,
  nextDrawn: DrawnCard | null,
): GameState {
  if (state.phase !== 'revealed') return state
  const player = state.players[state.currentPlayerIndex]
  if (player.timeline.length >= state.config.targetCards) {
    return { ...state, status: 'won', winnerId: player.id }
  }
  if (!nextDrawn) {
    return { ...state, status: 'won', winnerId: leaderId(state.players) }
  }
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    drawn: nextDrawn,
    phase: 'listening',
    lastOutcome: undefined,
  }
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex]
}

export function isWon(state: GameState): boolean {
  return state.status === 'won'
}

export function standings(state: GameState): Player[] {
  return [...state.players].sort(
    (a, b) => b.timeline.length - a.timeline.length,
  )
}
