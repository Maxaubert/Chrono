// src/ui/game/play/handGeometry.test.ts
import { expect, test } from 'vitest'
import { handLayout } from './handGeometry'

test('a single card is centred at full scale', () => {
  const { scale, cards } = handLayout(1)
  expect(scale).toBe(0.6)
  expect(cards).toEqual([{ rot: 0, tx: 0, ty: 0 }])
})

test('the fan is symmetric around the centre', () => {
  const { cards } = handLayout(5)
  expect(cards[0].tx).toBeCloseTo(-cards[4].tx)
  expect(cards[0].rot).toBeCloseTo(-cards[4].rot)
  expect(cards[2].tx).toBe(0)
})

test('a full 20-card hand scales down to fit the usable width', () => {
  const { scale } = handLayout(20)
  expect(scale).toBeLessThan(0.6)
  const span = (20 - 1) * 112 + 240
  expect(scale).toBeCloseTo(1180 / span)
})

test('count <= 0 yields no cards', () => {
  expect(handLayout(0).cards).toEqual([])
})
