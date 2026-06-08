import type { GameModule } from '../types'
import { FanCard } from './StarWarsCard'
import './skin.css'

/**
 * Star Wars game module. A specialized timeline deck riding the shared
 * deck-driven engine. Imperial-red dark-side vibe (red glow on deep space) with
 * a Distant Galaxy wordmark and a (local-only) video background. Events are
 * placed on the in-universe BBY/ABY axis. The wordmark + video are free
 * lookalikes/assets; the real Star Wars logo and footage are trademarks.
 */
export const starwars: GameModule = {
  id: 'starwars',
  name: 'Star Wars',
  description: 'Place the galaxy’s events on the timeline, from BBY to ABY.',
  playable: true,
  theme: {
    title: 'Star Wars',
    tagline: 'A long time ago... place it on the line.',
    titleFont: "'Distant Galaxy', 'Arial Narrow', 'Helvetica Neue', sans-serif",
    palette: {
      bg: '#070608',
      panel: '#140a0c',
      accent: '#ff3d3d',
      accent2: '#ff8f8f',
      glow: 'rgba(255, 61, 61, 0.18)',
      ink: '#1a0303',
    },
    skinClass: 'skin-starwars',
    FanCard,
    // Local-only menu background (the .mp4 is gitignored, so production falls
    // back to the CSS starfield in skin.css). Hitster handles its bg the same way.
    menuVideo: '/starwars/sith-trooper.mp4',
  },
}
