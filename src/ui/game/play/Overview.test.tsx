import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Overview from './Overview'
import type { Player } from '@/core'

const players: Player[] = [
  { id: 'p0', name: 'Anna', timeline: [{ id: 'a', year: 1990 }] },
  { id: 'p1', name: 'Ben', timeline: [] },
]

test('shows the current player turn and each score', () => {
  render(<Overview players={players} currentIndex={0} target={10} />)
  expect(screen.getAllByText(/ANNA/i).length).toBeGreaterThan(0)
  expect(screen.getByText('Ben')).toBeInTheDocument()
  expect(screen.getByText('1')).toBeInTheDocument()
})
