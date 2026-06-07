import type { GameModule } from '../types'
import { FanCard } from './StarWarsCard'
import './skin.css'

/**
 * Star Wars game module. A specialized timeline deck riding the shared
 * deck-driven engine. Deep-space crawl vibe (crawl-yellow on black). Events are
 * placed on the in-universe BBY/ABY axis. We do not ship the trademarked Star
 * Wars typeface; the wordmark uses a free condensed stack.
 */
export const starwars: GameModule = {
  id: 'starwars',
  name: 'Star Wars',
  description: 'Place the galaxy’s events on the timeline, from BBY to ABY.',
  playable: true,
  theme: {
    title: 'Star Wars',
    tagline: 'A long time ago... place it on the line.',
    titleFont:
      "'Arial Narrow', 'Franklin Gothic Medium', 'Helvetica Neue', sans-serif",
    palette: {
      bg: '#05060a',
      panel: '#0b0e16',
      accent: '#ffe81f',
      accent2: '#5fa8ff',
      glow: 'rgba(255, 232, 31, 0.18)',
      ink: '#0a0a04',
    },
    skinClass: 'skin-starwars',
    FanCard,
  },
}
