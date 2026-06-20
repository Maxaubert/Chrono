// src/spotify/pkce.test.ts
import { describe, expect, it } from 'vitest'
import { deriveChallenge, generateVerifier } from './pkce'

describe('pkce', () => {
  // RFC 7636 Appendix B vector.
  it('derives the S256 challenge from a known verifier', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    expect(await deriveChallenge(verifier)).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    )
  })

  it('generates a verifier in the RFC length range with url-safe chars', () => {
    const v = generateVerifier()
    expect(v.length).toBeGreaterThanOrEqual(43)
    expect(v.length).toBeLessThanOrEqual(128)
    expect(v).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })
})
