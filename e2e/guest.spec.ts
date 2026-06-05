// e2e/guest.spec.ts
import { expect, test } from '@playwright/test'

// ?guest=1 forces guest mode (no login; iTunes-preview playback in-page);
// ?mock=1 supplies a fixed deck so the run is deterministic and offline.
test('a guest game plays in-page (no QR, no login) through to a win', async ({
  page,
}) => {
  // Stub iTunes so the run never touches the network (mock tracks have no match
  // anyway); the provider fails soft and the game proceeds without audio.
  await page.route('**itunes.apple.com**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resultCount: 0, results: [] }),
    }),
  )

  await page.goto('/?guest=1&mock=1')

  // Guest mode skips the Spotify login gate entirely.
  await page.getByTestId('menu-play').click()
  await expect(page.getByTestId('spotify-login')).toHaveCount(0)

  // Setup: 2 players, target 3, add the mock deck, start.
  await page.getByTestId('name-0').fill('Anna')
  await page.getByTestId('name-1').fill('Ben')
  await page.getByTestId('target').fill('3')
  await page.getByTestId('setup-next').click()
  await page.getByTestId('import').click()
  await expect(page.getByTestId('review-next')).toBeEnabled()
  await page.getByTestId('review-next').click()
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()

  // The mystery card plays in-page: play/pause controls, and no scan-to-play QR.
  await expect(page.getByRole('button', { name: 'Replay' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(page.getByAltText('Scan to play')).toHaveCount(0)

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
