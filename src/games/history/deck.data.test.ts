import { describe, expect, it } from 'vitest'
import deck from './deck.json'

// The controlled vocabulary for category modes. Keep in sync with deck.tags.
const ALLOWED = new Set([
  'tech-science',
  'leader',
  'war',
  'empire',
  'faith',
  'exploration',
  'disaster',
])

type Card = {
  n: number
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  place: string
  description: string
  tags: string[]
}
const cards = deck.cards as Card[]

describe('deck.json cards', () => {
  it('gives every card the required non-empty fields', () => {
    for (const c of cards) {
      expect(typeof c.n, `${c.slug} n`).toBe('number')
      expect(c.slug.length, 'slug').toBeGreaterThan(0)
      expect(Number.isInteger(c.year), `${c.slug} year`).toBe(true)
      expect(c.yearLabel.length, `${c.slug} yearLabel`).toBeGreaterThan(0)
      expect(c.title.length, `${c.slug} title`).toBeGreaterThan(0)
      expect(c.era.length, `${c.slug} era`).toBeGreaterThan(0)
      expect(c.description.length, `${c.slug} description`).toBeGreaterThan(0)
    }
  })

  it('has unique slugs and unique n', () => {
    // A duplicated slug silently collapses entries in the image/clue lookup
    // Maps (src/ui/game/history/deck.ts), making two cards reveal the same art.
    const slugs = cards.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const ns = cards.map((c) => c.n)
    expect(new Set(ns).size).toBe(ns.length)
  })

  it('labels years by the deck convention: "<y> BC" for negatives, "<y>" otherwise', () => {
    for (const c of cards) {
      const expected = c.year < 0 ? `${-c.year} BC` : String(c.year)
      expect(c.yearLabel, c.slug).toBe(expected)
    }
  })

  it('never leaks the answer year in the clue description', () => {
    // The deck's own $comment forbids it: the description is the guess clue.
    for (const c of cards) {
      expect(c.description, c.slug).not.toContain(String(Math.abs(c.year)))
    }
  })
})

describe('deck.json tags', () => {
  it('declares the allowed vocabulary at the top level', () => {
    expect(new Set(deck.tags)).toEqual(ALLOWED)
  })

  it('gives every card a tags array drawn only from the vocabulary', () => {
    for (const c of cards) {
      expect(Array.isArray(c.tags), `${c.slug} has no tags array`).toBe(true)
      for (const t of c.tags) {
        expect(ALLOWED.has(t), `${c.slug} has unknown tag "${t}"`).toBe(true)
      }
      expect(new Set(c.tags).size, `${c.slug} has duplicate tags`).toBe(
        c.tags.length,
      )
    }
  })
})
