import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MysteryCard from './MysteryCard'

test('replay and pause call their handlers', async () => {
  const onReplay = vi.fn()
  const onPause = vi.fn()
  render(<MysteryCard onReplay={onReplay} onPause={onPause} />)
  await userEvent.click(screen.getByRole('button', { name: /replay/i }))
  await userEvent.click(screen.getByRole('button', { name: /pause/i }))
  expect(onReplay).toHaveBeenCalledOnce()
  expect(onPause).toHaveBeenCalledOnce()
})
