import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerGame, resetRegistry } from '@/games'
import { hitster } from '@/games/hitster'
import App from './App'

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
  sessionStorage.clear()
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

test('returning from Spotify auth reopens the setup wizard, not the menu', async () => {
  // The OAuth redirect reloads the app fresh; this flag, set when the host left
  // for Spotify, must reopen setup instead of dropping them on the front page.
  sessionStorage.setItem('chrono.resumeSetup', '1')

  render(<App />)

  // Setup reopens straight to the login gate, without clicking PLAY...
  expect(await screen.findByTestId('spotify-login')).toBeInTheDocument()
  // ...and the one-shot flag is consumed so a later reload shows the menu.
  expect(sessionStorage.getItem('chrono.resumeSetup')).toBeNull()
})
