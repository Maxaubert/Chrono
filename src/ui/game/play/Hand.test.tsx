import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hand from './Hand'
import type { Card } from '@/core'

const timeline: Card[] = [
  { id: 'a', year: 1990 },
  { id: 'b', year: 2001 },
]

test('renders one placement gap per slot (N+1) and reports the tapped slot', async () => {
  const onPlace = vi.fn()
  render(<Hand timeline={timeline} onPlace={onPlace} />)
  expect(screen.getByTestId('gap-0')).toBeInTheDocument()
  expect(screen.getByTestId('gap-2')).toBeInTheDocument()
  await userEvent.click(screen.getByTestId('gap-2'))
  expect(onPlace).toHaveBeenCalledWith(2)
})
