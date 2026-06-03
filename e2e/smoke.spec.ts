import { test, expect } from '@playwright/test'

test('home page shows the spike harness', async ({ page }) => {
  await page.goto('/')
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
