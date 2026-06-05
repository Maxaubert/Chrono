// src/ui/game/play/adapter.ts
import type { ComponentType } from 'react'
import type { DrawnCard } from '@/core'

/** Pops cards from a game's shuffled deck one at a time. Async because some
 *  games (Hitster) resolve a year per card and may skip unusable cards. */
export interface DeckHandle {
  next(): Promise<DrawnCard | null>
}

/** What the generic mystery slot passes to a game's mystery card. `drawn` lets
 *  a game render clue content (History); Hitster ignores it (audio only). */
export interface MysteryProps {
  drawn: DrawnCard | null
  isPlaying: boolean
  onPause: () => void
  onResume: () => void
  onReplay: () => void
}

/** Optional playback hooks. Omit the whole object for a silent game (History).
 *  Hooks may return a promise; the container handles rejections. */
export interface GameAudio {
  onDraw: (drawn: DrawnCard) => void | Promise<void>
  onPause: () => void | Promise<void>
  onResume: () => void | Promise<void>
  onReplay: (drawn: DrawnCard) => void | Promise<void>
  onStop: () => void | Promise<void>
}

export interface GameSetupResult {
  names: string[]
  targetCards: number
}

export interface GameSetupProps {
  onStart: (result: GameSetupResult) => void
  onClose?: () => void
  /** Enter guest mode from the setup gate (Hitster). */
  onGuest?: () => void
}

/** Everything a game supplies to become playable on the shared loop. */
export interface GamePlay {
  /** Build the shuffled draw pile from setup; return a handle to pop cards. */
  initDeck: (
    result: GameSetupResult,
    rng: () => number,
  ) => Promise<DeckHandle> | DeckHandle
  /** Rendered in the mystery slot for the current drawn card. */
  Mystery: ComponentType<MysteryProps>
  /** Image shown on the reveal; RevealOverlay renders title/subtitle/year. */
  revealImage?: (drawn: DrawnCard) => string | undefined
  /** Omit for a silent game. */
  audio?: GameAudio
  /** Collects names + win target (+ any game payload) and calls onStart. */
  Setup: ComponentType<GameSetupProps>
}
