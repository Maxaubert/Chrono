// e2e/guest.spec.ts
import { expect, test } from '@playwright/test'

// ?guest=1 forces guest mode (no login, QR playback); ?mock=1 supplies a fixed
// deck so the run is deterministic and offline.
test('a guest game shows a QR (no in-app player) and plays to a win', async ({
  page,
}) => {
  await page.goto('/?guest=1&mock=1')

  // Guest mode skips the Spotify login gate entirely.
  await page.getByTestId('menu-play').click()
  await expect(page.getByTestId('spotify-login')).toHaveCount(0)

  // Setup step 1: 2 players, target 3, then NEXT.
  await page.getByTestId('name-0').fill('Anna')
  await page.getByTestId('name-1').fill('Ben')
  await page.getByTestId('target').fill('3')
  await page.getByTestId('setup-next').click()

  // Setup step 2: add the mock deck, advance to review, start.
  await page.getByTestId('import').click()
  await expect(page.getByTestId('review-next')).toBeEnabled()
  await page.getByTestId('review-next').click()
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // The mystery card is a scan-to-play QR, not an in-app player.
  await expect(page.getByAltText('Scan to play')).toBeVisible()
  await expect(page.getByText('SCAN TO PLAY')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Replay' })).toHaveCount(0)

  // Play through: place each card after the rightmost (always correct in mock).
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
    await Promise.race([
      winner.waitFor({ state: 'visible' }),
      enabledCards.last().waitFor({ state: 'visible' }),
    ])
  }

  await expect(winner).toBeVisible()
  await expect(winner).toContainText('wins')
})
