import rawDeck from '@/games/history/deck.json'
import type { DrawnCard } from '@/core'
import type { DeckHandle } from '../play/adapter'

interface HistoryCardData {
  slug: string
  year: number
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
    reveal: { title: c.title, subtitle: c.era, year: c.year },
  }
}

/** Fisher-Yates shuffle into a new array using an injected rng (0..1). */
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A DeckHandle over the shuffled History deck (static; years are known). */
export function makeHistoryDeck(rng: () => number): DeckHandle {
  const pile = shuffle(CARDS, rng)
  let i = 0
  return {
    async next() {
      return i < pile.length ? toDrawn(pile[i++]) : null
    },
  }
}
