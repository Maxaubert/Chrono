import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSpotifyConfig } from './config'

afterEach(() => vi.unstubAllEnvs())

describe('getSpotifyConfig', () => {
  it('returns clientId and redirectUri from env', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'abc123')
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5173/callback')
    expect(getSpotifyConfig()).toEqual({
      clientId: 'abc123',
      redirectUri: 'http://127.0.0.1:5173/callback',
    })
  })

  it('throws a helpful error when clientId is missing', () => {
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '')
    expect(() => getSpotifyConfig()).toThrow(/VITE_SPOTIFY_CLIENT_ID/)
  })
})
