// src/ui/game/WinScreen.tsx
import type { GameState } from '@/core'
import { standings } from '@/core'

export default function WinScreen({
  state,
  onPlayAgain,
}: {
  state: GameState
  onPlayAgain: () => void
}) {
  const winner = state.players.find((p) => p.id === state.winnerId)
  return (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 data-testid="winner" className="text-3xl font-bold">
        {winner?.name} wins!
      </h1>
      <ul className="mt-6 inline-block text-left">
        {standings(state).map((p) => (
          <li key={p.id}>
            {p.name}: {p.timeline.length} cards
          </li>
        ))}
      </ul>
      <div>
        <button
          className="mt-6 rounded bg-purple-600 px-4 py-2 text-white"
          onClick={onPlayAgain}
        >
          Play again
        </button>
      </div>
    </main>
  )
}
