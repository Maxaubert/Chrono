import rawDeck from '@/games/starwars/deck.json'
import type { DrawnCard } from '@/core'

interface StarWarsCardData {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  description: string
}

export const CARDS = rawDeck.cards as StarWarsCardData[]

/** Slug -> guess clue shown on the mystery card. */
export const clueBySlug = new Map(
  CARDS.map((c) => [c.slug, c.description] as const),
)

/** Map a raw Star Wars card to the engine's DrawnCard. `year` is the signed sort
 *  key (BBY negative); `yearLabel` ("32 BBY", "0 ABY") drives the display. */
export function toDrawn(c: StarWarsCardData): DrawnCard {
  return {
    card: { id: c.slug, year: c.year },
    reveal: {
      title: c.title,
      subtitle: c.era,
      year: c.year,
      yearLabel: c.yearLabel,
    },
  }
}
