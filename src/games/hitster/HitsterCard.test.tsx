import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FanCard, SAMPLE_DECK } from './HitsterCard'
import { hitster } from './index'

test('FanCard renders the indexed song year', () => {
  render(<FanCard index={0} />)
  expect(screen.getAllByText(SAMPLE_DECK[0].year).length).toBeGreaterThan(0)
})

test('hitster module exposes a playable theme', () => {
  expect(hitster.theme.title).toBe('Hitster')
  expect(hitster.playable).toBe(true)
  expect(hitster.theme.skinClass).toBe('skin-hitster')
  expect(hitster.theme.palette.accent).toMatch(/^#/)
})
