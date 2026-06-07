import { useState } from 'react'
import { useActiveGame } from '../../theme/activeGameContext'
import type { GameSetupProps } from '../play/adapter'
import './static-setup.css'

/**
 * Generic new-game setup for a static-deck game (no audio, no Spotify): players
 * + win target, then START. Theme-driven - the wordmark/tagline come from the
 * active game's theme, and colours from its CSS variables, so each specialized
 * deck (Star Wars, ...) gets its own look with no per-game setup code. The
 * data-testids (name-0..5, target, start-game, player-plus/minus, setup-close)
 * are load-bearing for the shared e2e and must not change.
 */
export default function StaticDeckSetup({ onStart, onClose }: GameSetupProps) {
  const { game } = useActiveGame()
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState(10)

  function setCountAndNames(n: number) {
    const c = Math.min(6, Math.max(2, n))
    setCount(c)
    setNames((prev) => {
      const next = prev.slice(0, c)
      while (next.length < c) next.push('')
      return next
    })
  }

  const namesReady = names.every((n) => n.trim().length > 0)

  return (
    <div
      className="sd-screen"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sd-frame">
        {onClose && (
          <button
            className="sd-close"
            data-testid="setup-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        )}

        <aside className="sd-rail">
          <div className="sd-kicker">New Game</div>
          <div className="sd-wordmark">{game.theme.title}</div>
          <div className="sd-blurb">{game.theme.tagline}</div>
        </aside>

        <main className="sd-form">
          <section className="sd-section">
            <div className="sd-label">Players</div>
            <div className="sd-stepper">
              <button
                className="sd-step-btn"
                data-testid="player-minus"
                aria-label="Fewer players"
                disabled={count <= 2}
                onClick={() => setCountAndNames(count - 1)}
              >
                &minus;
              </button>
              <div className="sd-step-val">
                {count}
                <span className="sd-step-unit">of 6</span>
              </div>
              <button
                className="sd-step-btn"
                data-testid="player-plus"
                aria-label="More players"
                disabled={count >= 6}
                onClick={() => setCountAndNames(count + 1)}
              >
                +
              </button>
            </div>
            <div className="sd-names">
              {names.map((name, i) => (
                <label className="sd-name" key={i}>
                  <span className="sd-name-idx">{i + 1}</span>
                  <input
                    data-testid={`name-${i}`}
                    placeholder={`Player ${i + 1}`}
                    value={name}
                    onChange={(e) =>
                      setNames((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="sd-section">
            <div className="sd-label">Win At</div>
            <div className="sd-winrow">
              <input
                className="sd-win"
                data-testid="target"
                type="number"
                min={2}
                max={20}
                value={target}
                onChange={(e) =>
                  setTarget(Math.min(20, Math.max(2, Number(e.target.value))))
                }
              />
              <span className="sd-win-sub">cards to win</span>
              <input
                className="sd-slider"
                type="range"
                min={2}
                max={20}
                value={Math.min(20, target)}
                onChange={(e) => setTarget(Number(e.target.value))}
                aria-label="cards to win"
              />
            </div>
          </section>

          <button
            className="sd-start"
            data-testid="start-game"
            disabled={!namesReady}
            onClick={() =>
              onStart({
                names: names.map((n) => n.trim()),
                targetCards: target,
              })
            }
          >
            <span>Start Game</span>
            <span className="sd-k">&#9656;</span>
          </button>
        </main>
      </div>
    </div>
  )
}
