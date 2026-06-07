import { describe, expect, it } from 'vitest'
import deck from './deck.json'

type Card = {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  place: string
  description: string
}
const cards = deck.cards as Card[]

describe('starwars deck.json', () => {
  it('has at least 10 cards', () => {
    expect(cards.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every card the required fields', () => {
    for (const c of cards) {
      expect(typeof c.slug).toBe('string')
      expect(typeof c.year).toBe('number')
      expect(c.yearLabel.length).toBeGreaterThan(0)
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    }
  })

  it('has unique slugs', () => {
    const slugs = cards.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('is stored in strictly increasing year order (no ties)', () => {
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].year).toBeGreaterThan(cards[i - 1].year)
    }
  })

  it('labels BBY for negative years and ABY for non-negative', () => {
    for (const c of cards) {
      expect(c.yearLabel).toMatch(c.year < 0 ? /BBY$/ : /ABY$/)
    }
  })

  it('never leaks the BBY/ABY answer in the clue', () => {
    for (const c of cards) {
      expect(c.description).not.toMatch(/BBY|ABY/)
    }
  })
})
