import { useEffect, useState } from 'react'
import './turn-switch.css'

/** Covers the screen between turns: fades in, announces the next player, then
 *  lifts. onCovered fires once fully covered (swap the player behind it); the
 *  cover holds until BOTH the hold time has elapsed AND onCovered's work (the
 *  async next-card draw) has settled, so a slow network can never lift the
 *  cover while the previous turn's state is still on screen. onDone fires when
 *  it has cleared. */
const TIMING = { cover: 430, hold: 1200, out: 440 }

export default function TurnSwitch({
  name,
  onCovered,
  onDone,
}: {
  name: string
  onCovered: () => void | Promise<void>
  onDone: () => void
}) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    let cancelled = false
    let doneTimer: number | undefined
    const t1 = window.setTimeout(() => {
      setPhase('hold')
      // The caller handles its own failures (surfacing an error); the cover
      // only cares that the work is no longer in flight.
      const covered = Promise.resolve()
        .then(() => onCovered())
        .catch(() => {})
      const held = new Promise((r) =>
        window.setTimeout(r, TIMING.hold - TIMING.cover),
      )
      void Promise.all([covered, held]).then(() => {
        if (cancelled) return
        setPhase('out')
        doneTimer = window.setTimeout(() => onDone(), TIMING.out)
      })
    }, TIMING.cover)
    return () => {
      cancelled = true
      clearTimeout(t1)
      clearTimeout(doneTimer)
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
