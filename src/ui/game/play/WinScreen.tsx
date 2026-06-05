import type { GameState } from '@/core'
import { standings } from '@/core'
import './win.css'

export default function WinScreen({
  state,
  onPlayAgain,
}: {
  state: GameState
  onPlayAgain: () => void
}) {
  const winner = state.players.find((p) => p.id === state.winnerId)
  return (
    <div className="win-screen">
      <h1 data-testid="winner" className="win-title">
        {winner?.name} wins
      </h1>
      <ul className="win-standings">
        {standings(state).map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <b>{p.timeline.length}</b>
          </li>
        ))}
      </ul>
      <button className="win-again" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  )
}
