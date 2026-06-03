// src/ui/game/TurnScreen.tsx
import type { GameState } from '@/core'
import { currentPlayer, standings } from '@/core'

export default function TurnScreen({
  state,
  onPlace,
  onPause,
  onReplay,
}: {
  state: GameState
  onPlace: (slotIndex: number) => void
  onPause: () => void
  onReplay: () => void
}) {
  const player = currentPlayer(state)
  const timeline = player.timeline

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="flex items-baseline justify-between">
        <h2 data-testid="current-player" className="text-xl font-bold">
          {player.name}'s turn
        </h2>
        <span className="text-sm text-neutral-500">
          {timeline.length} / {state.config.targetCards}
        </span>
      </div>

      <ul className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
        {standings(state).map((p) => (
          <li key={p.id}>
            {p.name}: {p.timeline.length}
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded border border-dashed p-5 text-center">
        <div className="text-lg font-semibold">Now playing (hidden)</div>
        <div className="mt-2 flex justify-center gap-2">
          <button
            className="rounded bg-neutral-200 px-3 py-1"
            onClick={onPause}
          >
            Pause
          </button>
          <button
            className="rounded bg-neutral-200 px-3 py-1"
            onClick={onReplay}
          >
            Replay
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        Tap where this song belongs on your timeline (older to newer).
      </p>
      <div className="mt-2 flex items-stretch gap-2 overflow-x-auto py-2">
        {timeline.map((card, i) => (
          <div key={card.id} className="contents">
            <button
              data-testid={`gap-${i}`}
              className="min-w-[44px] rounded border-2 border-dashed px-2 text-neutral-400 hover:border-purple-500 hover:text-purple-600"
              onClick={() => onPlace(i)}
            >
              +
            </button>
            <div className="min-w-[110px] rounded border border-emerald-500 bg-emerald-50 p-3 text-center">
              <div className="text-lg font-bold">{card.year}</div>
            </div>
          </div>
        ))}
        <button
          data-testid={`gap-${timeline.length}`}
          className="min-w-[44px] rounded border-2 border-dashed px-2 text-neutral-400 hover:border-purple-500 hover:text-purple-600"
          onClick={() => onPlace(timeline.length)}
        >
          +
        </button>
      </div>
    </main>
  )
}
