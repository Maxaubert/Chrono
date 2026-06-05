import { expect, test } from 'vitest'
import { GuestProvider } from './guest'

test('GuestProvider is identified as guest', () => {
  expect(new GuestProvider().id).toBe('guest')
})

test('GuestProvider playback methods are no-ops that resolve', async () => {
  const p = new GuestProvider()
  await expect(p.play({ uri: 'spotify:track:abc' })).resolves.toBeUndefined()
  await expect(p.pause()).resolves.toBeUndefined()
  await expect(p.resume()).resolves.toBeUndefined()
  await expect(p.stop()).resolves.toBeUndefined()
})
