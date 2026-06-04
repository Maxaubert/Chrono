import type { ComponentType } from 'react'

/**
 * A game module plugs a specific game (Hitster, History, ...) into the shared
 * shell and engine. The shell discovers games through the registry and never
 * hard-codes any single game.
 */

/** Palette values applied as CSS variables for the active game's skin. */
export interface ThemePalette {
  bg: string
  panel: string
  accent: string
  accent2: string
  glow: string
  ink: string
}

/** Everything the shell needs to paint itself in a game's vibe. */
export interface GameTheme {
  /** Wordmark text shown as the menu title. */
  title: string
  /** Short tagline under the title. */
  tagline: string
  /** font-family for the wordmark (applied via the --title-font CSS variable). */
  titleFont: string
  /** Palette written to CSS variables on the themed root. */
  palette: ThemePalette
  /** Root class that the game's skin CSS is scoped under (e.g. 'skin-hitster'). */
  skinClass: string
  /** Decorative card for the menu fan, given its slot index (0-based). */
  FanCard: ComponentType<{ index: number }>
}

export interface GameModule {
  readonly id: string
  readonly name: string
  readonly description: string
  /** True when this game has a real engine wired to the PLAY button. */
  readonly playable: boolean
  readonly theme: GameTheme
}
