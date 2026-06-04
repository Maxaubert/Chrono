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

test('starts on the menu, PLAY enters setup (login gate when not connected)', async () => {
  render(<App />)
  expect(screen.getByTestId('menu-play')).toBeInTheDocument()
  expect(screen.queryByTestId('spotify-login')).not.toBeInTheDocument()

  await userEvent.click(screen.getByTestId('menu-play'))

  // The wipe transition covers, swaps to the game behind it, then reveals the
  // Setup wizard. Not logged in -> the login gate (only "Log in with Spotify").
  expect(await screen.findByTestId('spotify-login')).toBeInTheDocument()
})
