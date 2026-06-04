import type { GameModule } from '../types'
import { FanCard } from './HitsterCard'

/**
 * Hitster (music) game module. Retro-scifi vibe. Phase 1 adds Spotify playlist
 * import, release-year cards, and the Web Playback SDK audio source.
 */
export const hitster: GameModule = {
  id: 'hitster',
  name: 'Hitster',
  description: 'Guess where a song lands in time and build your timeline.',
  playable: true,
  theme: {
    title: 'Hitster',
    tagline: 'Hear it. Place it. Hold the line.',
    palette: {
      bg: '#08060f',
      panel: '#0e0a1a',
      accent: '#9a6bff',
      accent2: '#6b3fd6',
      glow: 'rgba(154, 107, 255, 0.17)',
      ink: '#0f0820',
    },
    skinClass: 'skin-hitster',
    FanCard,
  },
}
