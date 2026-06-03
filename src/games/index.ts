import { registerGame } from './registry'
import { hitster } from './hitster'

/** Register every built-in game. Import this once at app startup. */
export function registerBuiltInGames(): void {
  registerGame(hitster)
}

export { listGames, getGame, registerGame, resetRegistry } from './registry'
export type { GameModule } from './types'
