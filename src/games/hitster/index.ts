import type { GameModule } from '../types'

/**
 * Hitster (music) game module. Phase 0 stub: identity only. Phase 1 adds Spotify
 * playlist import, release-year cards, and the Web Playback SDK audio source.
 */
export const hitster: GameModule = {
  id: 'hitster',
  name: 'Hitster',
  description: 'Guess where a song lands in time and build your timeline.',
}
