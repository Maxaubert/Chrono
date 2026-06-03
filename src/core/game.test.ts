import { describe, expect, it } from 'vitest'
import { startGame, placeCard, advanceTurn, type DrawnCard } from './game'

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

describe('advanceTurn', () => {
  const twoPlayers = () =>
    startGame(
      { targetCards: 2 },
      [
        { id: 'p1', name: 'Anna' },
        { id: 'p2', name: 'Ben' },
      ],
      [
        { id: 'a1', year: 1980 },
        { id: 'a2', year: 1990 },
      ],
      drawn('d1', 1985),
    )

  it('rotates to the next player and sets the next drawn card', () => {
    const placed = placeCard(twoPlayers(), 1) // Anna keeps -> timeline length 2
    // targetCards is 2, so Anna has actually already won; use a higher target here
    const hiTarget = { ...placed, config: { targetCards: 10 } }
    const next = advanceTurn(hiTarget, drawn('d2', 1995))
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.phase).toBe('listening')
    expect(next.drawn).toEqual(drawn('d2', 1995))
    expect(next.lastOutcome).toBeUndefined()
  })

  it('declares the current player the winner at the target', () => {
    const placed = placeCard(twoPlayers(), 1) // Anna reaches 2 cards, target is 2
    const next = advanceTurn(placed, drawn('d2', 1995))
    expect(next.status).toBe('won')
    expect(next.winnerId).toBe('p1')
  })

  it('ends the game with the leader when the deck is exhausted', () => {
    const placed = placeCard(
      { ...twoPlayers(), config: { targetCards: 10 } },
      1,
    ) // Anna has 2, Ben has 1
    const next = advanceTurn(placed, null)
    expect(next.status).toBe('won')
    expect(next.winnerId).toBe('p1')
  })

  it('is a no-op when not in the revealed phase', () => {
    const s = twoPlayers()
    expect(advanceTurn(s, drawn('d2', 1995))).toBe(s)
  })
})
