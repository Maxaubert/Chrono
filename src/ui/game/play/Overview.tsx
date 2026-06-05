import type { Player } from '@/core'
import './overview.css'

export default function Overview({
  players,
  currentIndex,
  target,
}: {
  players: Player[]
  currentIndex: number
  target: number
}) {
  const turnName = players[currentIndex]?.name ?? ''
  return (
    <aside className="ov">
      <div className="ov-turn">
        <span className="ov-dot" />
        {turnName.toUpperCase()}&rsquo;S TURN
      </div>
      <div className="ov-rows">
        {players.map((p, i) => {
          const n = p.timeline.length
          return (
            <div
              className={`ov-row ${i === currentIndex ? 'on' : ''}`}
              key={p.id}
            >
              <span className="ov-name">{p.name}</span>
              <span className="ov-bar">
                <i style={{ width: `${Math.min(100, (n / target) * 100)}%` }} />
              </span>
              <span className="ov-count">
                {n}
                <b>/{target}</b>
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
