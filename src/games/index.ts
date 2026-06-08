import { registerGame } from './registry'
import { hitster } from './hitster'
import { history } from './history'
import { starwars } from './starwars'

/** Register every built-in game. Import this once at app startup. */
export function registerBuiltInGames(): void {
  registerGame(hitster)
  registerGame(history)
  registerGame(starwars)
}

export { listGames, getGame, registerGame, resetRegistry } from './registry'
export type { GameModule } from './types'
