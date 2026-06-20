import { describe, it, expect } from 'vitest'
import type { Card } from './types'
import { insertAt, isPlacementCorrect } from './timeline'

const card = (id: string, year: number): Card => ({ id, year })

describe('isPlacementCorrect', () => {
  const timeline = [card('a', 1970), card('b', 1990), card('c', 2010)]

  it('accepts a card that fits between two neighbours', () => {
    expect(isPlacementCorrect(timeline, card('x', 1980), 1)).toBe(true)
  })

  it('accepts placing before the first card', () => {
    expect(isPlacementCorrect(timeline, card('x', 1960), 0)).toBe(true)
  })

  it('accepts placing after the last card', () => {
    expect(isPlacementCorrect(timeline, card('x', 2020), 3)).toBe(true)
  })

  it('rejects a card that is too late for its slot', () => {
    expect(isPlacementCorrect(timeline, card('x', 1985), 0)).toBe(false)
  })

  it('rejects a card that is too early for its slot', () => {
    expect(isPlacementCorrect(timeline, card('x', 1995), 1)).toBe(false)
  })

  it('treats tied years as acceptable on either side', () => {
    expect(isPlacementCorrect(timeline, card('x', 1990), 1)).toBe(true)
    expect(isPlacementCorrect(timeline, card('x', 1990), 2)).toBe(true)
  })

  it('rejects out-of-range slots', () => {
    expect(isPlacementCorrect(timeline, card('x', 1980), -1)).toBe(false)
    expect(isPlacementCorrect(timeline, card('x', 1980), 99)).toBe(false)
  })

  it('accepts any slot on an empty timeline', () => {
    expect(isPlacementCorrect([], card('x', 2000), 0)).toBe(true)
  })
})

describe('insertAt', () => {
  it('inserts at the chosen slot without mutating the original', () => {
    const timeline = [card('a', 1970), card('c', 2010)]
    const result = insertAt(timeline, card('b', 1990), 1)
    expect(result.map((c) => c.id)).toEqual(['a', 'b', 'c'])
    expect(timeline).toHaveLength(2)
  })
})
