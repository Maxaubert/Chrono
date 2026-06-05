// src/ui/game/history/HistorySetup.tsx
import { useState } from 'react'
import { useActiveGame } from '../../theme/activeGameContext'
import type { GameSetupProps } from '../play/adapter'
import '../setup.css'

/**
 * History's new-game setup, shown as a popup over the menu. History is silent
 * and uses a static deck, so there are no Spotify steps: just players + win
 * target, then START. Reuses the SetupScreen players-step markup and classes.
 */
export default function HistorySetup({ onStart, onClose }: GameSetupProps) {
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
      className="setup-screen"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="su-frame">
        {onClose && (
          <button
            className="su-close"
            data-testid="setup-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        )}

        <aside className="su-rail">
          <span className="su-slash su-slash-tl" />
          <span className="su-slash su-slash-br" />
          <div>
            <div className="su-kicker">// NEW GAME</div>
            <div className="su-wordmark">{game.theme.title}</div>
            <div className="su-blurb">{game.theme.tagline}</div>
          </div>
          <div className="su-fan" aria-hidden="true">
            <div className="su-card su-card-1" />
            <div className="su-card su-card-2" />
            <div className="su-card su-card-3" />
          </div>
          <div className="su-foot">
            <span className="su-dot" /> LOCAL &middot; PASS &amp; PLAY
          </div>
        </aside>

        <main className="su-form">
          <section className="su-section">
            <div className="su-label">Players</div>
            <div className="su-stepper">
              <button
                className="su-step-btn"
                data-testid="player-minus"
                disabled={count <= 2}
                onClick={() => setCountAndNames(count - 1)}
              >
                &minus;
              </button>
              <div className="su-step-val">
                {count}
                <span className="su-step-unit">/ 6</span>
              </div>
              <button
                className="su-step-btn"
                data-testid="player-plus"
                disabled={count >= 6}
                onClick={() => setCountAndNames(count + 1)}
              >
                +
              </button>
            </div>
            <div className="su-names">
              {names.map((name, i) => (
                <label className="su-name" key={i}>
                  <span className="su-name-idx">P{i + 1}</span>
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

          <section className="su-section">
            <div className="su-label">Win At</div>
            <div className="su-winrow">
              <input
                className="su-win"
                data-testid="target"
                type="number"
                min={2}
                max={20}
                value={target}
                onChange={(e) =>
                  setTarget(Math.min(20, Math.max(2, Number(e.target.value))))
                }
              />
              <span className="su-win-sub">cards to win</span>
              <input
                className="su-slider"
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
            className="su-start"
            data-testid="start-game"
            disabled={!namesReady}
            onClick={() =>
              onStart({
                names: names.map((n) => n.trim()),
                targetCards: target,
              })
            }
          >
            <span>START GAME</span>
            <span className="su-k">&#9654;</span>
          </button>
        </main>
      </div>
    </div>
  )
}
