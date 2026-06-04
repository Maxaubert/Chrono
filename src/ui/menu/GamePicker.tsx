import { listGames } from '@/games'
import { useActiveGame } from '../theme/ThemeProvider'

/**
 * Overlay to switch the active game. Lists every registered game with its
 * accent swatch + tagline; picking one reskins the whole menu live.
 */
export default function GamePicker({ onClose }: { onClose: () => void }) {
  const { game, setGame } = useActiveGame()
  const games = listGames()

  return (
    <div className="gp-overlay" data-testid="game-picker" onClick={onClose}>
      <div className="gp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gp-head">CHOOSE GAME</div>
        <div className="gp-list">
          {games.map((g) => (
            <button
              key={g.id}
              className={`gp-item ${g.id === game.id ? 'on' : ''}`}
              data-testid={`game-option-${g.id}`}
              onClick={() => {
                setGame(g.id)
                onClose()
              }}
            >
              <span
                className="gp-dot"
                style={{ background: g.theme.palette.accent }}
              />
              <span className="gp-name">{g.name}</span>
              <span className="gp-tag">{g.theme.tagline}</span>
              {!g.playable && <span className="gp-soon">SOON</span>}
            </button>
          ))}
        </div>
        <button
          className="gp-close"
          data-testid="game-picker-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
