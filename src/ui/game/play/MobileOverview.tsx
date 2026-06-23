import type { Player } from '@/core'

/**
 * Compact horizontal scoreboard strip for the mobile play screen. Reuses the
 * same data shape as the desktop {@link Overview} (players, currentIndex,
 * target) but lays the players out as a single scrollable row of chips, each
 * with a small progress bar, with the current player highlighted. New markup
 * scoped under `.mobile-game-screen` so it never touches the desktop sidebar.
 */
export default function MobileOverview({
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
    <div className="mov" aria-label="Scoreboard">
      <div className="mov-turn">
        <span className="mov-dot" />
        {turnName.toUpperCase()}&rsquo;S TURN
      </div>
      <div className="mov-chips">
        {players.map((p, i) => {
          const n = p.timeline.length
          return (
            <div
              className={`mov-chip ${i === currentIndex ? 'on' : ''}`}
              key={p.id}
            >
              <span className="mov-name">{p.name}</span>
              <span className="mov-count">
                {n}
                <b>/{target}</b>
              </span>
              <span className="mov-bar">
                <i style={{ width: `${Math.min(100, (n / target) * 100)}%` }} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
