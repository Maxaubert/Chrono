import { useState, type CSSProperties, type ReactNode } from 'react'
import { getGame, listGames } from '@/games'
import { ActiveGameContext } from './activeGameContext'

const DEFAULT_GAME_ID = 'hitster'

/**
 * Applies the active game's vibe: writes its palette to CSS variables and adds
 * its skin class to a wrapper, so the shared menu layout (which reads var(--*))
 * and the game's scoped skin CSS paint together.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(DEFAULT_GAME_ID)
  const game = getGame(id) ?? getGame(DEFAULT_GAME_ID) ?? listGames()[0]
  if (!game) throw new Error('ThemeProvider: no games registered')

  const p = game.theme.palette
  const style = {
    '--bg': p.bg,
    '--panel': p.panel,
    '--accent': p.accent,
    '--accent2': p.accent2,
    '--glow': p.glow,
    '--ink': p.ink,
    '--title-font': game.theme.titleFont,
  } as CSSProperties

  return (
    <ActiveGameContext.Provider value={{ game, setGame: setId }}>
      <div className={game.theme.skinClass} style={style}>
        {children}
      </div>
    </ActiveGameContext.Provider>
  )
}
