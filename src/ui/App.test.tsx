import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('starts on the menu, PLAY enters the game setup', async () => {
  render(<App />)
  expect(screen.getByTestId('menu-play')).toBeInTheDocument()
  expect(screen.queryByTestId('target')).not.toBeInTheDocument()

  await userEvent.click(screen.getByTestId('menu-play'))

  // SetupScreen is now showing (its player-count target input has testid "target")
  expect(screen.getByTestId('target')).toBeInTheDocument()
})
