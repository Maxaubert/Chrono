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

  // Each turn: pick the newest (rightmost) card, then place AFTER it (the
  // rightmost slot is always correct in mock), then Next. With target 3 and 2
  // players, the first player to 3 cards wins within a few turns.
  for (let i = 0; i < 8; i++) {
    if (
      await page
        .getByTestId('winner')
        .isVisible()
        .catch(() => false)
    )
      break
    // pick the rightmost card, then tap its "after" slot
    const cards = page.locator('[data-testid^="hand-card-"]')
    await cards.last().click()
    await page.getByTestId('place-after').click()
    await expect(page.getByTestId('reveal')).toBeVisible()
    await page.getByTestId('next').click()
  }

  await expect(page.getByTestId('winner')).toBeVisible()
  await expect(page.getByTestId('winner')).toContainText('wins')
})
