import { describe, expect, it } from 'vitest'
import { startGame, placeCard, type DrawnCard } from './game'

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

describe('placeCard', () => {
  const base = () =>
    startGame(
      { targetCards: 10 },
      [{ id: 'p1', name: 'Anna' }],
      [{ id: 'a1', year: 1980 }],
      drawn('d1', 1990),
    )

  it('keeps the card and reveals on a correct placement', () => {
    // timeline [1980], placing 1990 after it (slot 1) is correct
    const next = placeCard(base(), 1)
    expect(next.phase).toBe('revealed')
    expect(next.lastOutcome).toEqual({ correct: true })
    expect(next.players[0].timeline.map((c) => c.year)).toEqual([1980, 1990])
  })

  it('discards the card and reveals on a wrong placement', () => {
    // placing 1990 before 1980 (slot 0) is wrong
    const next = placeCard(base(), 0)
    expect(next.phase).toBe('revealed')
    expect(next.lastOutcome).toEqual({ correct: false })
    expect(next.players[0].timeline.map((c) => c.year)).toEqual([1980])
  })

  it('is a no-op when not in the listening phase', () => {
    const revealed = placeCard(base(), 1)
    expect(placeCard(revealed, 0)).toBe(revealed)
  })
})
