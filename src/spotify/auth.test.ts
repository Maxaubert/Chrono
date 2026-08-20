// src/spotify/auth.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SCOPES,
  buildAuthorizeUrl,
  ensureFreshTokens,
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
    expect(url.searchParams.get('show_dialog')).toBe('true')
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
    const t = { accessToken: 'a', refreshToken: 'r', expiresAt: 120_000 }
    expect(isExpired(t, 70_000)).toBe(true) // within 60s skew window
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

  it('treats a corrupted stored entry as logged out instead of throwing', () => {
    localStorage.setItem('chrono.spotify.tokens', '{not json')
    expect(loadTokens()).toBeNull()
    // and the bad entry is dropped so it cannot break the next load either
    expect(localStorage.getItem('chrono.spotify.tokens')).toBeNull()
  })
})

describe('ensureFreshTokens', () => {
  const refreshResponse = {
    ok: true,
    json: async () => ({ access_token: 'AT2', expires_in: 3600 }),
  }

  it('returns stored tokens untouched while they are fresh', async () => {
    const t = { accessToken: 'AT1', refreshToken: 'RT', expiresAt: 3_600_000 }
    saveTokens(t)
    const fetchImpl = vi.fn()
    const result = await ensureFreshTokens({
      clientId: 'cid',
      now: 1_000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(result).toEqual(t)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('refreshes and persists expired tokens, keeping the refresh token', async () => {
    saveTokens({ accessToken: 'AT1', refreshToken: 'RT', expiresAt: 5_000 })
    const fetchImpl = vi.fn().mockResolvedValue(refreshResponse)
    const result = await ensureFreshTokens({
      clientId: 'cid',
      now: 10_000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(result).toEqual({
      accessToken: 'AT2',
      refreshToken: 'RT', // Spotify may omit refresh_token; the old one carries over
      expiresAt: 10_000 + 3_600_000,
    })
    expect(loadTokens()).toEqual(result) // persisted for the next caller
    const [, init] = fetchImpl.mock.calls[0]
    expect((init.body as URLSearchParams).get('grant_type')).toBe(
      'refresh_token',
    )
  })

  it('returns null when there are no tokens or no refresh token', async () => {
    expect(await ensureFreshTokens({ clientId: 'cid' })).toBeNull()
    saveTokens({ accessToken: 'AT1', refreshToken: '', expiresAt: 5_000 })
    expect(await ensureFreshTokens({ clientId: 'cid', now: 10_000 })).toBeNull()
  })

  it('returns null when the refresh request fails', async () => {
    saveTokens({ accessToken: 'AT1', refreshToken: 'RT', expiresAt: 5_000 })
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    expect(
      await ensureFreshTokens({
        clientId: 'cid',
        now: 10_000,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).toBeNull()
  })
})
