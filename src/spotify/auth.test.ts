// src/spotify/auth.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SCOPES,
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  isExpired,
  loadTokens,
  saveTokens,
  clearTokens,
} from './auth'

afterEach(() => localStorage.clear())

describe('buildAuthorizeUrl', () => {
  it('includes PKCE + client params', () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: 'cid',
        redirectUri: 'http://127.0.0.1:5173/callback',
        challenge: 'chal',
      }),
    )
    expect(url.origin + url.pathname).toBe(
      'https://accounts.spotify.com/authorize',
    )
    expect(url.searchParams.get('client_id')).toBe('cid')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('code_challenge')).toBe('chal')
    expect(url.searchParams.get('scope')).toBe(SCOPES.join(' '))
  })
})

describe('exchangeCodeForTokens', () => {
  it('POSTs the code and maps the token response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'AT',
        refresh_token: 'RT',
        expires_in: 3600,
      }),
    })
    const tokens = await exchangeCodeForTokens({
      code: 'CODE',
      verifier: 'VER',
      clientId: 'cid',
      redirectUri: 'http://127.0.0.1:5173/callback',
      now: 1000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(tokens).toEqual({
      accessToken: 'AT',
      refreshToken: 'RT',
      expiresAt: 1000 + 3600 * 1000,
    })
    const [endpoint, init] = fetchImpl.mock.calls[0]
    expect(endpoint).toBe('https://accounts.spotify.com/api/token')
    expect((init.body as URLSearchParams).get('grant_type')).toBe(
      'authorization_code',
    )
    expect((init.body as URLSearchParams).get('code_verifier')).toBe('VER')
  })
})

describe('isExpired', () => {
  it('treats tokens within a 60s skew as expired', () => {
    const t = { accessToken: 'a', refreshToken: 'r', expiresAt: 10_000 }
    expect(isExpired(t, 9_000)).toBe(true) // within 60s skew window
    expect(isExpired(t, 1_000)).toBe(false)
  })
})

describe('token storage', () => {
  it('saves and loads tokens', () => {
    const t = { accessToken: 'a', refreshToken: 'r', expiresAt: 5 }
    saveTokens(t)
    expect(loadTokens()).toEqual(t)
    clearTokens()
    expect(loadTokens()).toBeNull()
  })
})
