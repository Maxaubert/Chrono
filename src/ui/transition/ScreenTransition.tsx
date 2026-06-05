import { useEffect, useState, type CSSProperties } from 'react'
import { useActiveGame } from '../theme/activeGameContext'
import './screen-transition.css'

/**
 * A covering screen transition: a grid of tiles materializes in a diagonal
 * wave to cover the screen, the active game's wordmark fades in, then the tiles
 * dissolve outward to reveal the new page. The screen swap happens behind the
 * cover (onCover), hidden from view.
 *
 * Phases: in (tiles fill) -> hold (wordmark) -> out (tiles dissolve). onCover
 * fires once the screen is covered; onDone fires when the tiles have cleared.
 */
const TIMING = { cover: 560, hold: 1240, done: 1820 }

const COLS = 12
const ROWS = 7
const DMAX = COLS - 1 + (ROWS - 1)
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => ({
  i,
  d: (i % COLS) + Math.floor(i / COLS),
}))

export default function ScreenTransition({
  onCover,
  onDone,
}: {
  onCover: () => void
  onDone: () => void
}) {
  const { game } = useActiveGame()
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  // Run the timed phases once. onCover/onDone only call stable state setters,
  // so capturing them at mount is correct.
  useEffect(() => {
    const t1 = setTimeout(() => {
      onCover()
      setPhase('hold')
    }, TIMING.cover)
    const t2 = setTimeout(() => setPhase('out'), TIMING.hold)
    const t3 = setTimeout(() => onDone(), TIMING.done)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`xover ${phase}`} aria-hidden="true">
      <div className="xmosaic">
        {TILES.map((t) => (
          <span
            className="xtile"
            key={t.i}
            style={{ '--d': t.d, '--dr': DMAX - t.d } as CSSProperties}
          />
        ))}
      </div>
      <div className="xlogo-wrap">
        <div className="xlogo" data-text={game.theme.title}>
          {game.theme.title}
        </div>
      </div>
    </div>
  )
}
