import { makeDeckPlay } from '../deck/makeDeckPlay'
import { makeTypographicMystery } from '../deck/TypographicMystery'
import StaticDeckSetup from '../deck/StaticDeckSetup'
import { CARDS, clueBySlug, toDrawn } from './deck'

/** Star Wars play adapter: a static shuffled deck, a typographic clue mystery,
 *  a text reveal (no image), and the generic static-deck setup. */
export function makeStarWarsPlay() {
  return makeDeckPlay({
    cards: CARDS,
    toDrawn,
    Mystery: makeTypographicMystery(clueBySlug, 'When did it happen?'),
    Setup: StaticDeckSetup,
  })
}
