import { Fragment } from 'react'
import type { Card } from '@/core'
import HandCard from './HandCard'

/**
 * Mobile placement rail. Renders the current player's timeline as a
 * horizontally-scrollable row of their cards (reusing {@link HandCard} for the
 * visual, sized down via CSS) with a tappable `+` gap between every pair of
 * cards, plus one before the first and one after the last.
 *
 * Placement contract mirrors the desktop {@link Hand}: a timeline of N cards has
 * N+1 gaps; gap `k` (0..N) calls `onPlace(k)`. The mystery card being placed is
 * shown above in the mystery slot, so the rail only needs the gap targets.
 *
 * `interactive === false` disables the gaps (turn ending / switching); `piled`
 * collapses the rail into a calmer "handing off" look with no gaps.
 */
export default function MobileHand({
  timeline,
  onPlace,
  titleOf,
  artistOf,
  imageOf,
  labelOf,
  piled = false,
  interactive = true,
}: {
  timeline: Card[]
  onPlace: (slotIndex: number) => void
  titleOf?: (id: string) => string | undefined
  artistOf?: (id: string) => string | undefined
  imageOf?: (id: string) => string | null | undefined
  labelOf?: (id: string) => string | undefined
  piled?: boolean
  interactive?: boolean
}) {
  const n = timeline.length
  const showGaps = interactive && !piled

  // A gap button for slot k (0..n). The first gap keeps the desktop
  // `place-before` testid and the last keeps `place-after`, so existing tests
  // still resolve; every gap also carries `place-gap-{k}` for direct targeting.
  function gap(k: number) {
    const testid =
      k === 0 ? 'place-before' : k === n ? 'place-after' : `place-gap-${k}`
    return (
      <button
        key={`gap-${k}`}
        className="mhand-gap"
        data-testid={testid}
        data-gap={k}
        aria-label={`Place here (position ${k + 1})`}
        onClick={() => onPlace(k)}
      >
        <span className="mhand-plus">+</span>
        <span className="mhand-gap-label">PLACE</span>
      </button>
    )
  }

  return (
    <div className={`mhand ${piled ? 'piled' : ''}`}>
      <div className="mhand-rail">
        {showGaps && gap(0)}
        {timeline.map((card, i) => (
          <Fragment key={card.id}>
            <div className="mhand-card" data-testid={`hand-card-${i}`}>
              <HandCard
                id={card.id}
                year={labelOf?.(card.id) ?? card.year}
                title={titleOf?.(card.id)}
                artist={artistOf?.(card.id)}
                image={imageOf?.(card.id)}
              />
            </div>
            {showGaps && i < n - 1 && gap(i + 1)}
          </Fragment>
        ))}
        {showGaps && n > 0 && gap(n)}
      </div>
    </div>
  )
}
