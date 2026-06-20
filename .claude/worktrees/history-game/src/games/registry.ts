import type { GameModule } from './types'

const registry = new Map<string, GameModule>()

/** Register a game so the shell can offer it. Ignores duplicate ids after the first. */
export function registerGame(game: GameModule): void {
  if (!registry.has(game.id)) registry.set(game.id, game)
}

export function getGame(id: string): GameModule | undefined {
  return registry.get(id)
}

export function listGames(): GameModule[] {
  return [...registry.values()]
}

/** Test helper: clear all registered games. */
export function resetRegistry(): void {
  registry.clear()
}
