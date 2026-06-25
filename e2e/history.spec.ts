// e2e/history.spec.ts
import { expect, test } from '@playwright/test'

// History is silent and uses a static, shuffled deck (no Spotify, no ?mock=1),
// so this is a smoke playthrough: open History, start a 2-player game, and
// confirm the clue card + hand render and a placement opens the reveal. We do
// not force a win (the shuffle is non-deterministic).
test('History plays a clue card and reveals on placement', async ({ page }) => {
  await page.goto('/')

  // Swap to History via the game picker, then PLAY.
  await page.getByTestId('menu-choose-game').click()
  await page.getByTestId('game-option-history').click()
  await expect(page.getByTestId('menu-play')).toBeEnabled()
  await page.getByTestId('menu-play').click()

  // History setup: 2 players (default), name them, then START.
  await page.getByTestId('name-0').fill('Anna')
  await page.getByTestId('name-1').fill('Ben')
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // The game screen shows the framed text clue and the player's hand.
  await expect(page.locator('.fmyst')).toBeVisible()
  const handCard = page.getByTestId('hand-card-0')
  await expect(handCard).toBeVisible()

  // Place the card: pick it, then drop it after the anchor -> reveal overlay.
  await handCard.click()
  await page.getByTestId('place-after').click()
  await expect(page.getByTestId('reveal')).toBeVisible()
})
