import { expect, test } from 'vitest'
import { isSpotifyId } from './spotifyScraper'

test('isSpotifyId accepts a 22-char base62 id', () => {
  expect(isSpotifyId('3n3Ppam7vgaVa1iaRUc9Lp')).toBe(true)
})

test('isSpotifyId rejects path-traversal, urls, and wrong lengths', () => {
  expect(isSpotifyId('../../etc/passwd')).toBe(false)
  expect(isSpotifyId('https://evil.example/x')).toBe(false)
  expect(isSpotifyId('3n3Ppam7vgaVa1iaRUc9L')).toBe(false) // 21 chars
  expect(isSpotifyId('3n3Ppam7vgaVa1iaRUc9Lpx')).toBe(false) // 23 chars
  expect(isSpotifyId('3n3Ppam7vgaVa1iaRUc9L/')).toBe(false)
  expect(isSpotifyId('')).toBe(false)
  expect(isSpotifyId(undefined)).toBe(false)
  expect(isSpotifyId(42)).toBe(false)
})
