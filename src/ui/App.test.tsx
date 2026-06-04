import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerGame, resetRegistry } from '@/games'
import { hitster } from '@/games/hitster'
import App from './App'

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
})

test('starts on the menu, PLAY enters the game setup', async () => {
  render(<App />)
  expect(screen.getByTestId('menu-play')).toBeInTheDocument()
  expect(screen.queryByTestId('target')).not.toBeInTheDocument()

  await userEvent.click(screen.getByTestId('menu-play'))

  // The wipe transition covers the screen, swaps to the game behind it, then
  // reveals SetupScreen (its player-count target input has testid "target").
  expect(await screen.findByTestId('target')).toBeInTheDocument()
})
