import { Fragment, useState } from 'react'
import type { Card } from '@/core'
import HandCard from './HandCard'

/**
 * Mobile placement rail. Renders the current player's timeline as a
 * horizontally-scrollable row of their cards (reusing {@link HandCard}, sized
 * down via CSS). It mirrors the desktop {@link Hand} interaction rather than
 * showing every gap at once: you TAP a card to pick it, and only then do a
 * BEFORE and an AFTER target appear on either side of that card. Tapping the
 * picked card again (or the empty backdrop) cancels.
 *
 * Placement contract matches desktop: picking card `i`, BEFORE calls
 * `onPlace(i)` and AFTER calls `onPlace(i + 1)`.
 *
 * `interactive === false` blocks picking (turn ending / switching); `piled`
 * is the calmer hand-off look (also no placement targets).
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
  const [pickedState, setPicked] = useState<number | null>(null)
  // Ignore a stale pick while the hand is non-interactive (turn ending).
  const picked = interactive ? pickedState : null

  function pick(i: number) {
    setPicked((p) => (p === i ? null : i))
  }
  function place(slotIndex: number) {
    onPlace(slotIndex)
    setPicked(null)
  }

  function placeBox(slotIndex: number, side: 'before' | 'after') {
    return (
      <button
        className="mhand-gap"
        data-testid={side === 'before' ? 'place-before' : 'place-after'}
        data-gap={slotIndex}
        aria-label={
          side === 'before' ? 'Place before this card' : 'Place after this card'
        }
        onClick={() => place(slotIndex)}
      >
        <span className="mhand-plus">+</span>
        <span className="mhand-gap-label">
          {side === 'before' ? 'BEFORE' : 'AFTER'}
        </span>
      </button>
    )
  }

  return (
    <>
      {picked !== null && (
        <button
          className="mhand-cancel"
          aria-label="Cancel placement"
          onClick={() => setPicked(null)}
        />
      )}
      <div className={`mhand ${piled ? 'piled' : ''}`}>
        <p className="mhand-hint" aria-live="polite">
          {picked === null
            ? 'Tap a card, then place the mystery before or after it'
            : 'Tap BEFORE or AFTER to place the mystery'}
        </p>
        <div className="mhand-rail">
          {timeline.map((card, i) => (
            <Fragment key={card.id}>
              {picked === i && placeBox(i, 'before')}
              <button
                className={`mhand-card ${picked === i ? 'picked' : ''}`}
                data-testid={`hand-card-${i}`}
                aria-label={`Card ${labelOf?.(card.id) ?? card.year}`}
                disabled={!interactive}
                onClick={() => pick(i)}
              >
                <HandCard
                  id={card.id}
                  year={labelOf?.(card.id) ?? card.year}
                  title={titleOf?.(card.id)}
                  artist={artistOf?.(card.id)}
                  image={imageOf?.(card.id)}
                />
              </button>
              {picked === i && placeBox(i + 1, 'after')}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
