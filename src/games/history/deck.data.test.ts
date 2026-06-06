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

type TaggedCard = { slug: string; tags: string[] }
const cards = deck.cards as TaggedCard[]

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
