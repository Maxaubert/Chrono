// src/spotify/provider.test.ts
import { describe, expect, it, vi } from 'vitest'
import { SpotifyProvider } from './provider'

function okFetch() {
  return vi
    .fn()
    .mockResolvedValue({ ok: true, status: 204, json: async () => ({}) })
}

describe('SpotifyProvider', () => {
  it('plays a uri on the connected device', async () => {
    const fetchImpl = okFetch()
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: 'DEV1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await p.play({ uri: 'spotify:track:T1' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.spotify.com/v1/me/player/play?device_id=DEV1',
    )
    expect(init.method).toBe('PUT')
    expect(init.headers.Authorization).toBe('Bearer AT')
    expect(JSON.parse(init.body)).toEqual({ uris: ['spotify:track:T1'] })
  })

  it('pauses', async () => {
    const fetchImpl = okFetch()
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: 'DEV1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await p.pause()
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.spotify.com/v1/me/player/pause?device_id=DEV1',
    )
    expect(init.method).toBe('PUT')
  })

  it('throws if play is called before a device id exists', async () => {
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      deviceId: null,
      fetchImpl: okFetch() as unknown as typeof fetch,
    })
    await expect(p.play({ uri: 'spotify:track:T1' })).rejects.toThrow(
      /connect/i,
    )
  })

  it('awaits an async token source (silent refresh) before playing', async () => {
    const fetchImpl = okFetch()
    const p = new SpotifyProvider({
      getAccessToken: async () => 'FRESH',
      deviceId: 'DEV1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    await p.play({ uri: 'spotify:track:T1' })
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer FRESH',
    )
  })

  it('drops the device on not_ready and tears down on disconnect', async () => {
    const listeners: Record<string, (arg: unknown) => void> = {}
    const player = {
      addListener: vi.fn((e: string, cb: (arg: unknown) => void) => {
        listeners[e] = cb
        if (e === 'ready') queueMicrotask(() => cb({ device_id: 'DEV9' }))
      }),
      connect: vi.fn(async () => true),
      disconnect: vi.fn(),
    }
    window.Spotify = {
      Player: vi.fn(function () {
        return player
      }),
    } as unknown as typeof window.Spotify
    const p = new SpotifyProvider({
      getAccessToken: () => 'AT',
      fetchImpl: okFetch() as unknown as typeof fetch,
    })
    await p.connect()
    expect(p.isConnected).toBe(true)

    // device drops -> provider stops claiming to be connected
    listeners['not_ready']?.({ device_id: 'DEV9' })
    expect(p.isConnected).toBe(false)
    await expect(p.play({ uri: 'spotify:track:T1' })).rejects.toThrow(
      /connect/i,
    )

    p.disconnect()
    expect(player.disconnect).toHaveBeenCalled()
  })
})
