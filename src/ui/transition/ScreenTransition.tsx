import { useEffect, useState } from 'react'
import { useActiveGame } from '../theme/activeGameContext'
import './screen-transition.css'

/**
 * A covering screen transition: an accent panel wipes in to cover the screen,
 * the active game's wordmark does a glitch-settle, then the panel wipes off.
 * The screen swap happens behind the cover (onCover), hidden from view.
 *
 * Phases: in (wipe in) -> hold (logo) -> out (wipe off). onCover fires once the
 * screen is fully covered; onDone fires when the panel has wiped away.
 */
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
    }, 450)
    const t2 = setTimeout(() => setPhase('out'), 1200)
    const t3 = setTimeout(() => onDone(), 1650)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`xover ${phase}`} aria-hidden="true">
      <div className="xpanel">
        <div className="xlogo" data-text={game.theme.title}>
          {game.theme.title}
        </div>
      </div>
    </div>
  )
}
