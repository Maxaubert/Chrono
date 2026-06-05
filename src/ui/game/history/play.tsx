import type { GamePlay } from '../play/adapter'
import { imageBySlug, makeHistoryDeck } from './deck'
import HistoryMystery from './HistoryMystery'
import HistorySetup from './HistorySetup'

/** History's play adapter: a static shuffled deck, a text-clue mystery, a
 *  painting reveal, and no audio. */
export function makeHistoryPlay(): GamePlay {
  return {
    Setup: HistorySetup,
    Mystery: HistoryMystery,
    initDeck: (_result, rng) => makeHistoryDeck(rng),
    revealImage: (drawn) => imageBySlug.get(drawn.card.id),
  }
}
