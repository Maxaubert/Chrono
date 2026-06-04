import { beforeEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerGame, resetRegistry } from '@/games'
import { hitster } from '@/games/hitster'
import { ThemeProvider } from '../theme/ThemeProvider'
import MenuScreen from './MenuScreen'

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
})

function renderMenu(onPlay: () => void = () => {}) {
  return render(
    <ThemeProvider>
      <MenuScreen onPlay={onPlay} />
    </ThemeProvider>,
  )
}

test('shows the active game title and PLAY works', async () => {
  const onPlay = vi.fn()
  renderMenu(onPlay)
  expect(screen.getAllByText('Hitster').length).toBeGreaterThan(0)
  await userEvent.click(screen.getByTestId('menu-play'))
  expect(onPlay).toHaveBeenCalledOnce()
})

test('placeholder buttons are present but disabled', () => {
  renderMenu()
  for (const id of [
    'menu-choose-game',
    'menu-create-room',
    'menu-join-room',
    'menu-settings',
  ]) {
    expect(screen.getByTestId(id)).toBeDisabled()
  }
})
