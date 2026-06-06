// src/ui/game/history/HistorySetup.tsx
import { useState } from 'react'
import { useActiveGame } from '../../theme/activeGameContext'
import type { GameSetupProps } from '../play/adapter'
import './history-setup.css'

/**
 * History's new-game setup, shown as a popup over the menu. History is silent
 * and uses a static deck, so there are no Spotify steps: just players + win
 * target, then START.
 *
 * Unlike Hitster's edgy `su-*` HUD (setup.css), this has its own warm museum /
 * almanac styling (history-setup.css, the `hs-*` classes) to match the History
 * menu skin: paper grain, soft rounded warm panels, a serif wordmark with an
 * underline rule, gold + olive on warm dark. No purple, clip-paths or skew.
 *
 * Structure / behaviour mirror Hitster's setup so the e2e drives both the same
 * way. The exact data-testids (name-0..5, target, start-game, player-plus,
 * player-minus, setup-close) are load-bearing and must not change.
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
      className="hs-screen"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="hs-frame">
        {onClose && (
          <button
            className="hs-close"
            data-testid="setup-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        )}

        <aside className="hs-rail">
          <div className="hs-rail-head">
            <div className="hs-kicker">New Game</div>
            <div className="hs-wordmark">{game.theme.title}</div>
            <div className="hs-blurb">{game.theme.tagline}</div>
          </div>

          {/* three plain cards, softly fanned — the museum counterpoint to
              Hitster's card fan */}
          <div className="hs-stack" aria-hidden="true">
            <div className="hs-leaf hs-leaf-3" />
            <div className="hs-leaf hs-leaf-2" />
            <div className="hs-leaf hs-leaf-1" />
          </div>

          <div className="hs-foot">
            <span className="hs-dot" /> Local &middot; Pass &amp; Play
          </div>
        </aside>

        <main className="hs-form">
          <section className="hs-section">
            <div className="hs-label">Players</div>
            <div className="hs-stepper">
              <button
                className="hs-step-btn"
                data-testid="player-minus"
                aria-label="Fewer players"
                disabled={count <= 2}
                onClick={() => setCountAndNames(count - 1)}
              >
                &minus;
              </button>
              <div className="hs-step-val">
                {count}
                <span className="hs-step-unit">of 6</span>
              </div>
              <button
                className="hs-step-btn"
                data-testid="player-plus"
                aria-label="More players"
                disabled={count >= 6}
                onClick={() => setCountAndNames(count + 1)}
              >
                +
              </button>
            </div>
            <div className="hs-names">
              {names.map((name, i) => (
                <label className="hs-name" key={i}>
                  <span className="hs-name-idx">{i + 1}</span>
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

          <section className="hs-section">
            <div className="hs-label">Win At</div>
            <div className="hs-winrow">
              <input
                className="hs-win"
                data-testid="target"
                type="number"
                min={2}
                max={20}
                value={target}
                onChange={(e) =>
                  setTarget(Math.min(20, Math.max(2, Number(e.target.value))))
                }
              />
              <span className="hs-win-sub">cards to win</span>
              <input
                className="hs-slider"
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
            className="hs-start"
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
            <span className="hs-k">&#9656;</span>
          </button>
        </main>
      </div>
    </div>
  )
}
