import type { Card } from './types'

/**
 * A timeline is an ordered list of cards sorted ascending by year. A player
 * places a new card by choosing a slot index in `[0, timeline.length]`:
 *   - slot 0 places before the first card,
 *   - slot `timeline.length` places after the last card,
 *   - slot `i` places between card `i-1` and card `i`.
 *
 * This is the shared mechanic for every game (Hitster, History, ...).
 */

/** Insert a card into a sorted timeline at the given slot, returning a new array. */
export function insertAt(
  timeline: readonly Card[],
  card: Card,
  slotIndex: number,
): Card[] {
  const next = timeline.slice()
  next.splice(slotIndex, 0, card)
  return next
}

/**
 * Is placing `card` at `slotIndex` chronologically correct?
 * Boundaries are inclusive, so a card whose year ties a neighbour is accepted on
 * either side of that neighbour.
 */
export function isPlacementCorrect(
  timeline: readonly Card[],
  card: Card,
  slotIndex: number,
): boolean {
  if (slotIndex < 0 || slotIndex > timeline.length) return false
  const prev = timeline[slotIndex - 1]
  const next = timeline[slotIndex]
  if (prev && card.year < prev.year) return false
  if (next && card.year > next.year) return false
  return true
}
