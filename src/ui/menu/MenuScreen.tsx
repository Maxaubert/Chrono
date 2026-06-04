import './menu.css'
import { CardFront, SAMPLE_DECK } from './SongCard'

/**
 * The front page / main menu. PLAY enters the game; the other actions are
 * visible placeholders until those features exist. The card fan is decorative
 * (pointer-events disabled in menu.css).
 */
export default function MenuScreen({ onPlay }: { onPlay: () => void }) {
  const fan = ['c1', 'c2', 'c3', 'c4']
  return (
    <div className="menu-screen">
      <span className="slash s-tl" />
      <span className="slash s-br" />
      <span className="corner tl" />
      <span className="corner br" />

      <div className="split">
        <div className="left">
          <div className="hand">
            {fan.map((cls, i) => (
              <div className={`fan-slot ${cls}`} key={cls}>
                <CardFront song={SAMPLE_DECK[i]} />
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="kicker el d1">// TIMELINE PROTOCOL</div>
          <div className="logo crt el d2" data-text="CHRONO">
            CHRONO
          </div>
          <div className="tag el d3">Hear it. Place it. Hold the line.</div>

          <div className="menu">
            <button
              className="btn primary el d4"
              data-testid="menu-play"
              onClick={onPlay}
            >
              <span className="bt">PLAY</span>
              <span className="bk">&#9654;</span>
            </button>
            <button
              className="btn el d5"
              data-testid="menu-choose-game"
              disabled
              title="Coming soon"
            >
              <span className="bt">CHOOSE GAME</span>
              <span className="bx">HITSTER &middot; HISTORY</span>
            </button>
            <button
              className="btn el d6"
              data-testid="menu-create-room"
              disabled
              title="Coming soon"
            >
              <span className="bt">CREATE ROOM</span>
              <span className="bx">HOST ONLINE</span>
            </button>
            <button
              className="btn el d7"
              data-testid="menu-join-room"
              disabled
              title="Coming soon"
            >
              <span className="bt">JOIN ROOM</span>
              <span className="bx">ENTER CODE</span>
            </button>
            <button
              className="btn el d8"
              data-testid="menu-settings"
              disabled
              title="Coming soon"
            >
              <span className="bt">SETTINGS</span>
              <span className="bx">AUDIO &middot; RULES</span>
            </button>
          </div>

          <div className="foot el d8">
            v0.3.0 // BUILD 2049 &middot; LOCAL PASS &amp; PLAY
          </div>
        </div>
      </div>
    </div>
  )
}
