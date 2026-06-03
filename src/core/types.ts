/**
 * Core domain types for the timeline-guessing engine.
 *
 * This module is framework-agnostic: no React, no Spotify, no DOM. It must stay
 * portable so a future native build can reuse it verbatim. See
 * `.claude/rules/core-purity.md`.
 */

/** A card the player places on a timeline. */
export interface Card {
  id: string
  /** The year used to validate placement (e.g. song release year, event year). */
  year: number
}

/** What is shown when a card's identity is revealed after a guess. */
export interface CardReveal {
  title: string
  subtitle?: string
  year: number
}
