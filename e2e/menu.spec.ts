// e2e/menu.spec.ts
import { expect, test } from '@playwright/test'

test('the menu opens on Hitster and Choose Game swaps to History', async ({
  page,
}) => {
  await page.goto('/')

  // Default game is Hitster: its wordmark shows and PLAY is enabled.
  await expect(page.getByText('Hitster', { exact: true }).first()).toBeVisible()
  await expect(page.getByTestId('menu-play')).toBeEnabled()

  // Swap to History via the picker.
  await page.getByTestId('menu-choose-game').click()
  await page.getByTestId('game-option-history').click()

  // Reskinned: the History wordmark shows and PLAY is enabled (it's playable).
  await expect(page.getByText('History', { exact: true }).first()).toBeVisible()
  await expect(page.getByTestId('menu-play')).toBeEnabled()
})
