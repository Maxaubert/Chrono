import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HandCard from './HandCard'

test('renders a numeric year', () => {
  render(<HandCard id="a" year={1969} title="Moon" />)
  expect(screen.getByText('1969')).toBeInTheDocument()
})

test('renders a string year label (e.g. BBY/ABY or BCE)', () => {
  render(<HandCard id="b" year="32 BBY" title="Naboo" />)
  expect(screen.getByText('32 BBY')).toBeInTheDocument()
})
