import type { DrawnCard } from '@/core'
import type { DeckHandle } from '../play/adapter'

/** Fisher-Yates shuffle into a new array using an injected rng (0..1). */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A DeckHandle over a static, shuffled card list. `toDrawn` maps each raw card
 *  to the engine's DrawnCard. Years are known up front, but next() stays async
 *  to satisfy the DeckHandle contract (Hitster resolves years lazily). */
export function makeStaticDeck<T>(
  cards: readonly T[],
  toDrawn: (card: T) => DrawnCard,
  rng: () => number,
): DeckHandle {
  const pile = shuffle(cards, rng)
  let i = 0
  return {
    async next() {
      return i < pile.length ? toDrawn(pile[i++]) : null
    },
  }
}
