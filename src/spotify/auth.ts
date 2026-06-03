// src/spotify/auth.ts
import type { SpotifyTokens } from './types'

const AUTHORIZE = 'https://accounts.spotify.com/authorize'
const TOKEN = 'https://accounts.spotify.com/api/token'
const TOKENS_KEY = 'chrono.spotify.tokens'
const VERIFIER_KEY = 'chrono.spotify.verifier'
const EXPIRY_SKEW_MS = 5_000

/** streaming + user-read-* are required by the Web Playback SDK; modify lets us
 * start playback on our device. */
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
]

export function buildAuthorizeUrl(args: {
  clientId: string
  redirectUri: string
  challenge: string
}): string {
  const params = new URLSearchParams({
    client_id: args.clientId,
    response_type: 'code',
    redirect_uri: args.redirectUri,
    code_challenge_method: 'S256',
    code_challenge: args.challenge,
    scope: SCOPES.join(' '),
  })
  return `${AUTHORIZE}?${params.toString()}`
}

function mapTokenResponse(
  data: { access_token: string; refresh_token?: string; expires_in: number },
  now: number,
  fallbackRefresh?: string,
): SpotifyTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? fallbackRefresh ?? '',
    expiresAt: now + data.expires_in * 1000,
  }
}

export async function exchangeCodeForTokens(args: {
  code: string
  verifier: string
  clientId: string
  redirectUri: string
  now?: number
  fetchImpl?: typeof fetch
}): Promise<SpotifyTokens> {
  const f = args.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: args.clientId,
    code_verifier: args.verifier,
  })
  const res = await f(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  return mapTokenResponse(await res.json(), args.now ?? Date.now())
}

export async function refreshTokens(args: {
  refreshToken: string
  clientId: string
  now?: number
  fetchImpl?: typeof fetch
}): Promise<SpotifyTokens> {
  const f = args.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: args.refreshToken,
    client_id: args.clientId,
  })
  const res = await f(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  return mapTokenResponse(
    await res.json(),
    args.now ?? Date.now(),
    args.refreshToken,
  )
}

export function isExpired(tokens: SpotifyTokens, now = Date.now()): boolean {
  return now >= tokens.expiresAt - EXPIRY_SKEW_MS
}

export function saveTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function loadTokens(): SpotifyTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  return raw ? (JSON.parse(raw) as SpotifyTokens) : null
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY)
}

export function saveVerifier(verifier: string): void {
  sessionStorage.setItem(VERIFIER_KEY, verifier)
}

export function takeVerifier(): string | null {
  const v = sessionStorage.getItem(VERIFIER_KEY)
  if (v) sessionStorage.removeItem(VERIFIER_KEY)
  return v
}
