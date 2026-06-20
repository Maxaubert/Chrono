// src/spotify/sdk.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createConnectedPlayer } from './sdk'

function fakeSpotify(deviceId: string) {
  const listeners: Record<string, (arg: unknown) => void> = {}
  const player = {
    addListener: vi.fn((event: string, cb: (arg: unknown) => void) => {
      listeners[event] = cb
    }),
    connect: vi.fn(async () => {
      // fire 'ready' on next tick
      queueMicrotask(() => listeners['ready']?.({ device_id: deviceId }))
      return true
    }),
    disconnect: vi.fn(),
  }
  const Spotify = {
    Player: vi.fn(function () {
      return player
    }),
  } as unknown as typeof window.Spotify
  return { Spotify, player }
}

describe('createConnectedPlayer', () => {
  it('resolves the device id from the ready event', async () => {
    const { Spotify, player } = fakeSpotify('DEV123')
    const result = await createConnectedPlayer({
      name: 'Chrono',
      getToken: () => 'AT',
      spotify: Spotify,
    })
    expect(result.deviceId).toBe('DEV123')
    expect(result.player).toBe(player)
    expect(player.connect).toHaveBeenCalled()
  })

  it('rejects on account_error (non-premium)', async () => {
    const listeners: Record<string, (arg: unknown) => void> = {}
    const player = {
      addListener: vi.fn((e: string, cb: (arg: unknown) => void) => {
        listeners[e] = cb
      }),
      connect: vi.fn(async () => {
        queueMicrotask(() =>
          listeners['account_error']?.({ message: 'not premium' }),
        )
        return true
      }),
      disconnect: vi.fn(),
    }
    const Spotify = {
      Player: vi.fn(function () {
        return player
      }),
    } as unknown as typeof window.Spotify
    await expect(
      createConnectedPlayer({
        name: 'Chrono',
        getToken: () => 'AT',
        spotify: Spotify,
      }),
    ).rejects.toThrow(/premium/i)
  })
})
