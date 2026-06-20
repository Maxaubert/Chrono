import type { GameModule } from '../types'
import { FanCard } from './HistoryCard'
import './skin.css'

/**
 * History game module. Natural / stylish vibe (a contrast to Hitster's
 * retro-scifi). Theme-only placeholder for now: no engine yet, so PLAY is
 * disabled until the game is built.
 */
export const history: GameModule = {
  id: 'history',
  name: 'History',
  description: 'Place historic events where they belong on the timeline.',
  playable: true,
  theme: {
    title: 'History',
    tagline: 'When did it happen? Place it on the line.',
    titleFont: "Georgia, 'Times New Roman', serif",
    palette: {
      bg: '#11140f',
      panel: '#1a1f16',
      accent: '#cda349',
      accent2: '#8a9a6b',
      glow: 'rgba(205, 163, 73, 0.16)',
      ink: '#14140c',
    },
    skinClass: 'skin-history',
    FanCard,
  },
}
