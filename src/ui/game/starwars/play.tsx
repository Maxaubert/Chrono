import { makeDeckPlay } from '../deck/makeDeckPlay'
import { makeTypographicMystery } from '../deck/TypographicMystery'
import StaticDeckSetup from '../deck/StaticDeckSetup'
import { CARDS, clueBySlug, toDrawn } from './deck'

/** Star Wars play adapter: a static shuffled deck, a typographic clue mystery,
 *  a painted card image on reveal/timeline, and the generic static-deck setup.
 *  Card art lives at /starwars/cards/<slug>.jpg (5:7 portrait). */
export function makeStarWarsPlay() {
  return makeDeckPlay({
    cards: CARDS,
    toDrawn,
    Mystery: makeTypographicMystery(
      clueBySlug,
      'When did it happen?',
      (id) => `/starwars/cards/${id}.jpg`,
    ),
    Setup: StaticDeckSetup,
    revealImage: (drawn) => `/starwars/cards/${drawn.card.id}.jpg`,
  })
}
