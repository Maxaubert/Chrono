// src/ui/game/play/handGeometry.ts
export interface CardTransform {
  /** degrees */
  rot: number
  /** px (unscaled) */
  tx: number
  /** px (unscaled) */
  ty: number
}
export interface HandLayout {
  scale: number
  cards: CardTransform[]
}

const GAP_X = 112 // horizontal spacing between cards (unscaled px)
const CARD_W = 240 // matches .h-card width
const MAX_SCALE = 0.6
const USABLE_W = 1180 // px the hand may occupy before it must shrink

/** Fan transforms for a hand of `count` cards. Spreads horizontally (so each
 *  card stays tappable), tilts gently, arcs the outer cards down, and scales the
 *  whole hand down once it would exceed the usable width. */
export function handLayout(count: number): HandLayout {
  if (count <= 0) return { scale: MAX_SCALE, cards: [] }
  const mid = (count - 1) / 2
  const rotStep = Math.min(4, 26 / Math.max(1, count - 1))
  const span = (count - 1) * GAP_X + CARD_W
  const scale = Math.min(MAX_SCALE, USABLE_W / span)
  const cards = Array.from({ length: count }, (_, i) => {
    const off = i - mid
    return { rot: off * rotStep, tx: off * GAP_X, ty: Math.abs(off) * 7 }
  })
  return { scale, cards }
}
