import { useState, type CSSProperties } from 'react'
import type { Card } from '@/core'
import { handLayout, type CardTransform } from './handGeometry'
import HandCard from './HandCard'
import './hand.css'

/** Unscaled px the picked card rises out of the fan. */
const LIFT = 64
const CARD_W = 240
const SEP = 262 // distance from the picked card centre to each placement box
const SIDE = 150 // gap from a box to the nearest parted side card
const GAP = 112 // spacing among the parted side cards
const MAX_SCALE = 0.6
const USABLE_W = 1180

type Item =
  | { kind: 'card'; cardIdx: number; card: Card }
  | { kind: 'place'; slotIndex: number; side: 'before' | 'after' }

/** Focus layout for the picked state: the picked card centred + lifted, a box on
 *  each side, and the remaining cards parted out to the left and right. Returns a
 *  transform per sequence slot, in the same order as the rendered items. */
function pickedLayout(count: number, picked: number) {
  const xs: number[] = []
  const tr: Omit<CardTransform, 'tx'>[] = []
  for (let i = 0; i < picked; i++) {
    const d = picked - 1 - i // 0 = nearest the box
    xs.push(-SEP - SIDE - d * GAP)
    tr.push({ ty: 18 + d * 6, rot: -6 - d * 2 })
  }
  xs.push(-SEP)
  tr.push({ ty: 0, rot: 0 }) // before box
  xs.push(0)
  tr.push({ ty: -LIFT, rot: 0 }) // picked card
  xs.push(SEP)
  tr.push({ ty: 0, rot: 0 }) // after box
  for (let i = picked + 1; i < count; i++) {
    const d = i - picked - 1
    xs.push(SEP + SIDE + d * GAP)
    tr.push({ ty: 18 + d * 6, rot: 6 + d * 2 })
  }
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const mid = (minX + maxX) / 2
  const span = maxX - minX + CARD_W
  const scale = Math.min(MAX_SCALE, USABLE_W / span)
  const cards: CardTransform[] = xs.map((x, k) => ({
    tx: x - mid,
    ty: tr[k].ty,
    rot: tr[k].rot,
  }))
  return { scale, cards }
}

export default function Hand({
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
  // Which card is picked up (null = none). place()/cancel reset it; the turn
  // only advances after a placement, so it is never stale across a hand change.
  const [pickedState, setPicked] = useState<number | null>(null)
  // ignore any pick while the hand is non-interactive (turn ending / switching)
  const picked = interactive ? pickedState : null

  // Build the left-to-right sequence; when a card is picked, insert a placement
  // slot on each side.
  const items: Item[] = []
  timeline.forEach((card, i) => {
    if (picked === i) {
      items.push({ kind: 'place', slotIndex: i, side: 'before' })
      items.push({ kind: 'card', cardIdx: i, card })
      items.push({ kind: 'place', slotIndex: i + 1, side: 'after' })
    } else {
      items.push({ kind: 'card', cardIdx: i, card })
    }
  })

  const { scale, cards: pos } =
    picked === null
      ? handLayout(timeline.length)
      : pickedLayout(timeline.length, picked)

  function pick(i: number) {
    setPicked((p) => (p === i ? null : i))
  }
  function place(slotIndex: number) {
    onPlace(slotIndex)
    setPicked(null)
  }

  return (
    <>
      {picked !== null && (
        <button
          className="hand-cancel"
          aria-label="Cancel placement"
          onClick={() => setPicked(null)}
        />
      )}
      <div
        className={`hand ${piled ? 'piled' : ''}`}
        style={{ '--hand-scale': scale } as CSSProperties}
      >
        {items.map((it, k) => {
          const t = pos[k]
          const style = {
            '--tx': `${t.tx}px`,
            '--ty': `${t.ty}px`,
            '--rot': `${t.rot}deg`,
            '--i': k,
            '--ci': items.length - 1 - k,
          } as CSSProperties
          if (it.kind === 'place') {
            return (
              <div
                className="hand-slot hand-slot-place"
                key={`place-${it.side}`}
                style={style}
              >
                <button
                  className="place-box"
                  data-testid={`place-${it.side}`}
                  aria-label={
                    it.side === 'before'
                      ? 'Place before this card'
                      : 'Place after this card'
                  }
                  onClick={() => place(it.slotIndex)}
                >
                  <span className="place-plus">+</span>
                  <span className="place-label">
                    {it.side === 'before' ? 'BEFORE' : 'AFTER'}
                  </span>
                </button>
              </div>
            )
          }
          return (
            <div
              className={`hand-slot ${it.cardIdx === picked ? 'lifted' : ''}`}
              key={it.card.id}
              style={style}
            >
              <button
                className="hand-pick"
                data-testid={`hand-card-${it.cardIdx}`}
                aria-label={`Card ${labelOf?.(it.card.id) ?? it.card.year}`}
                disabled={!interactive}
                onClick={() => pick(it.cardIdx)}
              >
                <HandCard
                  id={it.card.id}
                  year={labelOf?.(it.card.id) ?? it.card.year}
                  title={titleOf?.(it.card.id)}
                  artist={artistOf?.(it.card.id)}
                  image={imageOf?.(it.card.id)}
                />
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
