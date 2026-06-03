import { describe, expect, it } from 'vitest'
import { startGame, type DrawnCard } from './game'

const drawn = (id: string, year: number): DrawnCard => ({
  card: { id, year },
  reveal: { title: `t-${id}`, subtitle: `a-${id}`, year },
})

describe('startGame', () => {
  it('seeds each player with their anchor and sets the first drawn card', () => {
    const state = startGame(
      { targetCards: 10 },
      [
        { id: 'p1', name: 'Anna' },
        { id: 'p2', name: 'Ben' },
      ],
      [
        { id: 'a1', year: 1980 },
        { id: 'a2', year: 1990 },
      ],
      drawn('d1', 2000),
    )
    expect(state.players.map((p) => p.name)).toEqual(['Anna', 'Ben'])
    expect(state.players[0].timeline).toEqual([{ id: 'a1', year: 1980 }])
    expect(state.players[1].timeline).toEqual([{ id: 'a2', year: 1990 }])
    expect(state.currentPlayerIndex).toBe(0)
    expect(state.phase).toBe('listening')
    expect(state.status).toBe('playing')
    expect(state.drawn).toEqual(drawn('d1', 2000))
    expect(state.config.targetCards).toBe(10)
  })
})
