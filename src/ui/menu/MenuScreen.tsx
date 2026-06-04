import './menu-base.css'
import { useActiveGame } from '../theme/ThemeProvider'

/**
 * The front page / main menu. Game-agnostic: it reads the active game's theme
 * (title, tagline, card, palette via ThemeProvider) and renders the shared
 * layout. PLAY enters the game when it's playable; the rest are placeholders.
 */
export default function MenuScreen({ onPlay }: { onPlay: () => void }) {
  const { game } = useActiveGame()
  const { theme } = game
  const fan = ['c1', 'c2', 'c3', 'c4']

  return (
    <div className="menu-screen">
      <span className="slash s-tl" />
      <span className="slash s-br" />

      <div className="split">
        <div className="left">
          <div className="hand">
            {fan.map((cls, i) => (
              <div className={`fan-slot ${cls}`} key={cls}>
                <theme.FanCard index={i} />
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="logo" data-text={theme.title}>
            {theme.title}
          </div>
          <div className="tag el d2">{theme.tagline}</div>

          <div className="menu">
            <button
              className="btn primary el d3"
              data-testid="menu-play"
              onClick={onPlay}
              disabled={!game.playable}
              title={game.playable ? undefined : 'Coming soon'}
            >
              <span className="bt">PLAY</span>
              <span className="bk">&#9654;</span>
            </button>
            <button
              className="btn el d4"
              data-testid="menu-choose-game"
              disabled
              title="Coming soon"
            >
              <span className="bt">CHOOSE GAME</span>
              <span className="bx">HITSTER &middot; HISTORY</span>
            </button>
            <button
              className="btn el d5"
              data-testid="menu-create-room"
              disabled
              title="Coming soon"
            >
              <span className="bt">CREATE ROOM</span>
              <span className="bx">HOST ONLINE</span>
            </button>
            <button
              className="btn el d6"
              data-testid="menu-join-room"
              disabled
              title="Coming soon"
            >
              <span className="bt">JOIN ROOM</span>
              <span className="bx">ENTER CODE</span>
            </button>
            <button
              className="btn el d7"
              data-testid="menu-settings"
              disabled
              title="Coming soon"
            >
              <span className="bt">SETTINGS</span>
              <span className="bx">AUDIO &middot; RULES</span>
            </button>
          </div>

          <div className="foot el d8">v0.3.0</div>
        </div>
      </div>
    </div>
  )
}
