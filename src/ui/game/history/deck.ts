import rawDeck from '@/games/history/deck.json'
import type { DrawnCard } from '@/core'
import type { DeckHandle } from '../play/adapter'
import { makeStaticDeck } from '../deck/staticDeck'

interface HistoryCardData {
  slug: string
  year: number
  yearLabel: string
  title: string
  era: string
  description: string
}

const CARDS = rawDeck.cards as HistoryCardData[]

/** Slug -> card image path (derived from the slug). */
export const imageBySlug = new Map(
  CARDS.map((c) => [c.slug, `/history/${c.slug}.jpg`] as const),
)
/** Slug -> guess clue (the description shown on the mystery card). */
export const clueBySlug = new Map(
  CARDS.map((c) => [c.slug, c.description] as const),
)

function toDrawn(c: HistoryCardData): DrawnCard {
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

/** A DeckHandle over the shuffled History deck (static; years are known). */
export function makeHistoryDeck(rng: () => number): DeckHandle {
  return makeStaticDeck(CARDS, toDrawn, rng)
}
