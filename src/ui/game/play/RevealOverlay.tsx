import type { GameState } from '@/core'
import './reveal.css'

export default function RevealOverlay({
  state,
  onNext,
}: {
  state: GameState
  onNext: () => void
}) {
  if (!state.drawn || !state.lastOutcome) return null
  const { title, subtitle, year } = state.drawn.reveal
  const correct = state.lastOutcome.correct
  return (
    <div className="reveal-scrim">
      <section data-testid="reveal" className="reveal-card">
        <div className="reveal-year">{year}</div>
        <div className="reveal-title">
          {title}
          {subtitle ? `, ${subtitle}` : ''}
        </div>
        <p
          data-testid="outcome"
          className={`reveal-outcome ${correct ? 'ok' : 'no'}`}
        >
          {correct ? 'Correct, card kept.' : 'Wrong, card discarded.'}
        </p>
        <button data-testid="next" className="reveal-next" onClick={onNext}>
          <span>NEXT</span>
          <span className="reveal-k">&#9654;</span>
        </button>
      </section>
    </div>
  )
}
