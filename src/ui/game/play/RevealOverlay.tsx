import type { GameState } from '@/core'
import { cardGradient } from './cardArt'
import './reveal.css'

export default function RevealOverlay({
  state,
  image,
  onNext,
}: {
  state: GameState
  image?: string | null
  onNext: () => void
}) {
  if (!state.drawn || !state.lastOutcome) return null
  const { title, subtitle, year } = state.drawn.reveal
  const id = state.drawn.card.id
  const correct = state.lastOutcome.correct
  const art = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: cardGradient(id) }
  return (
    <div className="reveal-scrim">
      <section
        data-testid="reveal"
        className={`reveal-card ${correct ? 'ok' : 'no'}`}
      >
        {/* the mystery track, now revealed */}
        <div className="reveal-the-card">
          <span className="reveal-c-year">{year}</span>
          <div className="reveal-c-art" style={art} />
          <div className="reveal-c-title">{title}</div>
          {subtitle && <div className="reveal-c-sub">{subtitle}</div>}
        </div>
        <p
          data-testid="outcome"
          className={`reveal-outcome ${correct ? 'ok' : 'no'}`}
        >
          {correct ? 'Correct. Card kept.' : 'Wrong. Card discarded.'}
        </p>
        <button data-testid="next" className="reveal-next" onClick={onNext}>
          <span>OK</span>
          <span className="reveal-k">&#9654;</span>
        </button>
      </section>
    </div>
  )
}
