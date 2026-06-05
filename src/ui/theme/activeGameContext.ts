import { createContext, useContext } from 'react'
import type { GameModule } from '@/games'

export type ActiveGame = {
  game: GameModule
  setGame: (id: string) => void
}

export const ActiveGameContext = createContext<ActiveGame | null>(null)

/** Read the active game + a setter to switch it. Must be inside <ThemeProvider>. */
export function useActiveGame(): ActiveGame {
  const value = useContext(ActiveGameContext)
  if (!value)
    throw new Error('useActiveGame must be used within <ThemeProvider>')
  return value
}
