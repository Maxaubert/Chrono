import { useReducer } from 'react'
import { advanceTurn, placeCard, type DrawnCard, type GameState } from '@/core'

export type GameAction =
  | { type: 'start'; state: GameState }
  | { type: 'place'; slotIndex: number }
  | { type: 'advance'; nextDrawn: DrawnCard | null }

export function gameReducer(
  state: GameState | null,
  action: GameAction,
): GameState | null {
  switch (action.type) {
    case 'start':
      return action.state
    case 'place':
      return state ? placeCard(state, action.slotIndex) : state
    case 'advance':
      return state ? advanceTurn(state, action.nextDrawn) : state
  }
}

export function useGame() {
  return useReducer(gameReducer, null)
}
