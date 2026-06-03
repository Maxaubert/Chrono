import { describe, expect, it } from 'vitest'
import { gameReducer } from './useGame'
import { startGame, type GameState, type DrawnCard } from '@/core'

const drawn = (id: string, year: number): DrawnCard => ({
  card: { id, year },
  reveal: { title: id, subtitle: id, year },
})

function playing(): GameState {
  return startGame(
    { targetCards: 10 },
    [
      { id: 'p1', name: 'A' },
      { id: 'p2', name: 'B' },
    ],
    [
      { id: 'a1', year: 1980 },
      { id: 'a2', year: 1990 },
    ],
    drawn('d1', 1985),
  )
}

describe('gameReducer', () => {
  it('start sets the initial state', () => {
    const state = gameReducer(null, { type: 'start', state: playing() })
    expect(state?.status).toBe('playing')
  })

  it('place delegates to placeCard', () => {
    const state = gameReducer(playing(), { type: 'place', slotIndex: 1 })
    expect(state?.phase).toBe('revealed')
  })

  it('advance delegates to advanceTurn', () => {
    const placed = gameReducer(playing(), { type: 'place', slotIndex: 1 })
    const next = gameReducer(placed, {
      type: 'advance',
      nextDrawn: drawn('d2', 1995),
    })
    expect(next?.phase).toBe('listening')
    expect(next?.currentPlayerIndex).toBe(1)
  })
})
