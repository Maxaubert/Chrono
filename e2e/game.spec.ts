// e2e/game.spec.ts
import { expect, test } from '@playwright/test'

test('a mock game plays through to a win', async ({ page }) => {
  await page.goto('/?mock=1')

  // Enter the game from the front-page menu.
  await page.getByTestId('menu-play').click()

  // Setup step 1: 2 players, target 3, then NEXT.
  await page.getByTestId('name-0').fill('Anna')
  await page.getByTestId('name-1').fill('Ben')
  await page.getByTestId('target').fill('3')
  await page.getByTestId('setup-next').click()

  // Setup step 2: add the mock deck, then advance to the review step.
  await page.getByTestId('import').click()
  await expect(page.getByTestId('review-next')).toBeEnabled()
  await page.getByTestId('review-next').click()

  // Setup step 3: review the game, then start.
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // Each turn: pick the newest (rightmost) enabled card, place AFTER it (the
  // rightmost slot is always correct in mock), OK, then wait out the turn-end
  // sequence (cards are disabled while it runs). Enabled cards only return when
  // the next hand is dealt, so we race that against the win.
  const winner = page.getByTestId('winner')
  const enabledCards = page.locator(
    '[data-testid^="hand-card-"]:not([disabled])',
  )
  for (let i = 0; i < 12; i++) {
    if (await winner.isVisible().catch(() => false)) break
    await enabledCards.last().click()
    await page.getByTestId('place-after').click()
    await expect(page.getByTestId('reveal')).toBeVisible()
    await page.getByTestId('next').click()
    // turn resolves into either a win or the next player's dealt hand
    await Promise.race([
      winner.waitFor({ state: 'visible' }),
      enabledCards.last().waitFor({ state: 'visible' }),
    ])
  }

  await expect(winner).toBeVisible()
  await expect(winner).toContainText('wins')
})
