import { test, expect } from '@playwright/test'

test('home page shows the app and the Hitster game', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Chrono', level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hitster' })).toBeVisible()
})
