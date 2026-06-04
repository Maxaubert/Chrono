// e2e/spike.spec.ts
import { expect, test } from '@playwright/test'

test('mock scan starts playback and shows Now playing', async ({ page }) => {
  await page.goto('/?spike=1&mock=1')

  // Mock mode is pre-logged-in and pre-connected.
  await expect(page.getByText('Player ready')).toBeVisible()

  // Seed cards render, then start scanning + simulate a scan.
  await page.getByRole('button', { name: 'Start scanning' }).click()
  await page.getByTestId('simulate-scan').click()

  await expect(page.getByTestId('now-playing')).toBeVisible()
  await expect(page.getByText('Now playing (hidden)')).toBeVisible()

  // Reveal shows the (mock) identity.
  await page.getByRole('button', { name: 'Reveal' }).click()
  await expect(page.getByTestId('reveal')).toContainText('Mock Song')
})
