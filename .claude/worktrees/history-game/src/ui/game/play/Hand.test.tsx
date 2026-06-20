import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hand from './Hand'
import type { Card } from '@/core'

const timeline: Card[] = [
  { id: 'a', year: 1990 },
  { id: 'b', year: 2001 },
]

test('placement slots appear only after a card is picked', () => {
  render(<Hand timeline={timeline} onPlace={vi.fn()} />)
  expect(screen.queryByTestId('place-before')).toBeNull()
  expect(screen.queryByTestId('place-after')).toBeNull()
})

test('picking a card then tapping "after" places at index + 1', async () => {
  const onPlace = vi.fn()
  render(<Hand timeline={timeline} onPlace={onPlace} />)
  await userEvent.click(screen.getByTestId('hand-card-1')) // pick the 2nd card
  expect(screen.getByTestId('place-before')).toBeInTheDocument()
  expect(screen.getByTestId('place-after')).toBeInTheDocument()
  await userEvent.click(screen.getByTestId('place-after'))
  expect(onPlace).toHaveBeenCalledWith(2) // after card index 1 = slot 2
})

test('tapping "before" places at the card index', async () => {
  const onPlace = vi.fn()
  render(<Hand timeline={timeline} onPlace={onPlace} />)
  await userEvent.click(screen.getByTestId('hand-card-0')) // pick the 1st card
  await userEvent.click(screen.getByTestId('place-before'))
  expect(onPlace).toHaveBeenCalledWith(0)
})

test('tapping the picked card again cancels (slots disappear)', async () => {
  render(<Hand timeline={timeline} onPlace={vi.fn()} />)
  await userEvent.click(screen.getByTestId('hand-card-0'))
  expect(screen.getByTestId('place-after')).toBeInTheDocument()
  await userEvent.click(screen.getByTestId('hand-card-0'))
  expect(screen.queryByTestId('place-after')).toBeNull()
})
