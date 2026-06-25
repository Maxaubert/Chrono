// e2e/starwars.spec.ts
import { expect, test } from '@playwright/test'

// Star Wars is silent and uses a static, shuffled deck (no Spotify, no ?mock=1).
// Smoke playthrough: open Star Wars, start a 2-player game, confirm the clue card
// + hand render, a placement opens the reveal, and the reveal shows a BBY/ABY label.
test('Star Wars plays a clue card and reveals a BBY/ABY label', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByTestId('menu-choose-game').click()
  await page.getByTestId('game-option-starwars').click()
  await expect(page.getByTestId('menu-play')).toBeEnabled()
  await page.getByTestId('menu-play').click()

  // Generic static-deck setup: 2 players (default), name them, then START.
  await page.getByTestId('name-0').fill('Luke')
  await page.getByTestId('name-1').fill('Leia')
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // The game screen shows the typographic clue card and the player's hand.
  await expect(page.locator('.fmyst')).toBeVisible()
  const handCard = page.getByTestId('hand-card-0')
  await expect(handCard).toBeVisible()

  // Place the card: pick it, drop it after the anchor -> reveal overlay.
  await handCard.click()
  await page.getByTestId('place-after').click()
  const reveal = page.getByTestId('reveal')
  await expect(reveal).toBeVisible()
  // The revealed year is a BBY/ABY label, not a raw number.
  await expect(reveal.locator('.reveal-c-year')).toContainText(/BBY|ABY/)
})
