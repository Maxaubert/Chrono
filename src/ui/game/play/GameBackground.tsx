import { type CSSProperties } from 'react'
import './game-background.css'

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 4.137) * 43758.5453
  return x - Math.floor(x)
}
type Bar = { i: number; lo: number; hi: number; dur: number; delay: number }
const makeBars = (n: number): Bar[] =>
  Array.from({ length: n }, (_, i) => {
    const env = 0.6 + 0.4 * Math.sin((Math.PI * i) / (n - 1))
    return {
      i,
      lo: 0.08 + rnd(i, 2) * 0.12,
      hi: Math.min(1, (0.42 + rnd(i, 1) * 0.58) * env),
      dur: 0.7 + rnd(i, 3) * 0.95,
      delay: -rnd(i, 4) * 2,
    }
  })
const EQ_FRONT = makeBars(70)
const EQ_BACK = makeBars(34)

function eqBar(b: Bar) {
  return (
    <span
      key={b.i}
      className="bg-eq-bar"
      style={
        {
          '--lo': b.lo,
          '--hi': b.hi,
          animationDuration: `${b.dur.toFixed(2)}s`,
          animationDelay: `${b.delay.toFixed(2)}s`,
        } as CSSProperties
      }
    />
  )
}

/** Dark, sleek backdrop with a soft glowing "sharp" audio waveform (merged
 *  blurred bars), centred in the mid band, clear of the deck. Decorative. */
export default function GameBackground() {
  return (
    <div className="game-bg" aria-hidden="true">
      <div className="game-bg-glow" />
      <div className="bg-eq-wrap">
        <div className="bg-eq bg-eq-back">{EQ_BACK.map(eqBar)}</div>
        <div className="bg-eq bg-eq-front">{EQ_FRONT.map(eqBar)}</div>
      </div>
    </div>
  )
}
