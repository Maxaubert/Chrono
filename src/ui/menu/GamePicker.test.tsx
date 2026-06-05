import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerGame, resetRegistry } from '@/games'
import { hitster } from '@/games/hitster'
import { history } from '@/games/history'
import { ThemeProvider } from '../theme/ThemeProvider'
import MenuScreen from './MenuScreen'

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
  registerGame(history)
})

test('choosing History from the picker reskins the menu live', async () => {
  render(
    <ThemeProvider>
      <MenuScreen onPlay={() => {}} />
    </ThemeProvider>,
  )

  // Default is Hitster: PLAY is enabled (it has an engine).
  expect(screen.getByTestId('menu-play')).toBeEnabled()

  await userEvent.click(screen.getByTestId('menu-choose-game'))
  expect(screen.getByTestId('game-picker')).toBeInTheDocument()

  await userEvent.click(screen.getByTestId('game-option-history'))

  // Reskinned to History: title shows, PLAY enabled (it's playable), picker closed.
  expect(screen.getAllByText('History').length).toBeGreaterThan(0)
  expect(screen.getByTestId('menu-play')).toBeEnabled()
  expect(screen.queryByTestId('game-picker')).not.toBeInTheDocument()
})
