// src/ui/game/RevealPanel.tsx
import type { GameState } from '@/core'

export default function RevealPanel({
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
    <section
      data-testid="reveal"
      className="mx-auto mt-6 max-w-2xl rounded-lg border p-5"
    >
      <p className="text-lg font-semibold">
        {title}
        {subtitle ? `, ${subtitle}` : ''} ({year})
      </p>
      <p
        data-testid="outcome"
        className={correct ? 'mt-2 text-emerald-600' : 'mt-2 text-red-600'}
      >
        {correct ? 'Correct, card kept.' : 'Wrong, card discarded.'}
      </p>
      <button
        data-testid="next"
        className="mt-4 rounded bg-purple-600 px-4 py-2 text-white"
        onClick={onNext}
      >
        Next
      </button>
    </section>
  )
}
