// e2e/game.spec.ts
import { expect, test } from '@playwright/test'

test('a mock game plays through to a win', async ({ page }) => {
  await page.goto('/?mock=1')

  // Setup: 2 players, target 3, import the mock deck.
  await page.getByTestId('name-0').fill('Anna')
  await page.getByTestId('name-1').fill('Ben')
  await page.getByTestId('target').fill('3')
  await page.getByTestId('import').click()
  await expect(page.getByText('songs')).toBeVisible()
  await page.getByTestId('start-game').click()

  // Each turn: place at the rightmost gap (always correct in mock), then Next.
  // With target 3 and 2 players, the first player to 3 cards wins within a few turns.
  for (let i = 0; i < 8; i++) {
    if (
      await page
        .getByTestId('winner')
        .isVisible()
        .catch(() => false)
    )
      break
    // rightmost gap = the highest-indexed gap currently rendered
    const gaps = page.locator('[data-testid^="gap-"]')
    await gaps.last().click()
    await expect(page.getByTestId('reveal')).toBeVisible()
    await page.getByTestId('next').click()
  }

  await expect(page.getByTestId('winner')).toBeVisible()
  await expect(page.getByTestId('winner')).toContainText('wins')
})
