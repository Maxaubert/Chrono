import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuScreen from './MenuScreen'

test('PLAY calls onPlay', async () => {
  const onPlay = vi.fn()
  render(<MenuScreen onPlay={onPlay} />)
  await userEvent.click(screen.getByTestId('menu-play'))
  expect(onPlay).toHaveBeenCalledOnce()
})

test('placeholder buttons are present but disabled', () => {
  render(<MenuScreen onPlay={() => {}} />)
  for (const id of [
    'menu-choose-game',
    'menu-create-room',
    'menu-join-room',
    'menu-settings',
  ]) {
    expect(screen.getByTestId(id)).toBeDisabled()
  }
})
