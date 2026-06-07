import type { ComponentType } from 'react'
import type { DrawnCard } from '@/core'
import type { GamePlay, GameSetupProps, MysteryProps } from '../play/adapter'
import { makeStaticDeck } from './staticDeck'

export interface DeckPlayConfig<T> {
  cards: readonly T[]
  toDrawn: (card: T) => DrawnCard
  Mystery: ComponentType<MysteryProps>
  Setup: ComponentType<GameSetupProps>
  /** Omit for a typographic (image-less) deck. */
  revealImage?: (drawn: DrawnCard) => string | undefined
}

/** Assemble a GamePlay for a static deck. The engine, turns, reveal and win flow
 *  are shared; only the cards, mystery, setup and (optional) reveal image vary. */
export function makeDeckPlay<T>(config: DeckPlayConfig<T>): GamePlay {
  return {
    initDeck: (_result, rng) =>
      makeStaticDeck(config.cards, config.toDrawn, rng),
    Mystery: config.Mystery,
    Setup: config.Setup,
    revealImage: config.revealImage,
  }
}
