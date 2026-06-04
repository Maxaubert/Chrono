import { test, expect } from '@playwright/test'

test('the spike harness route shows the spike harness', async ({ page }) => {
  await page.goto('/?spike=1')
  await expect(
    page.getByRole('heading', {
      name: 'Chrono spike: playback + scan',
      level: 1,
    }),
  ).toBeVisible()
  // Logged out, not mock: the Spotify login entry point is shown.
  await expect(
    page.getByRole('button', { name: 'Log in with Spotify' }),
  ).toBeVisible()
})
