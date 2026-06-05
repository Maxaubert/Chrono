import { useEffect, useState } from 'react'
import './turn-switch.css'

/** Covers the screen between turns: fades in, announces the next player, then
 *  lifts. onCovered fires once fully covered (swap the player behind it);
 *  onDone fires when it has cleared. */
const TIMING = { cover: 430, hold: 1200, done: 1640 }

export default function TurnSwitch({
  name,
  onCovered,
  onDone,
}: {
  name: string
  onCovered: () => void
  onDone: () => void
}) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => {
      onCovered()
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
    <div className={`tswitch ${phase}`} aria-hidden="true">
      <div className="tswitch-panel">
        <div className="tswitch-kicker">PASS THE DEVICE</div>
        <div className="tswitch-name">{name}</div>
        <div className="tswitch-sub">IT&rsquo;S YOUR TURN</div>
      </div>
    </div>
  )
}
