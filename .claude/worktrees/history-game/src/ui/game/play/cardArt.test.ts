// src/ui/game/play/cardArt.test.ts
import { expect, test } from 'vitest'
import { cardGradient } from './cardArt'

test('same id always yields the same gradient', () => {
  expect(cardGradient('abc')).toBe(cardGradient('abc'))
})

test('different ids generally differ', () => {
  expect(cardGradient('abc')).not.toBe(cardGradient('xyz'))
})

test('returns a CSS linear-gradient string', () => {
  expect(cardGradient('abc')).toMatch(/^linear-gradient\(150deg, hsl\(/)
})
