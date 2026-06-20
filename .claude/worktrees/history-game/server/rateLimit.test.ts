import { describe, expect, it } from 'vitest'
import { clientIp, createRateLimiter } from './rateLimit'

describe('createRateLimiter', () => {
  it('allows up to the limit, then rejects within the window', () => {
    let t = 1000
    const rl = createRateLimiter({ limit: 3, windowMs: 1000, now: () => t })
    expect(rl('a').ok).toBe(true)
    expect(rl('a').ok).toBe(true)
    expect(rl('a').ok).toBe(true)
    const blocked = rl('a')
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks keys independently', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t })
    expect(rl('a').ok).toBe(true)
    expect(rl('b').ok).toBe(true) // different key, not blocked
    expect(rl('a').ok).toBe(false)
  })

  it('lets requests through again once the window slides past', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t })
    expect(rl('a').ok).toBe(true)
    expect(rl('a').ok).toBe(false)
    t = 1001 // window elapsed
    expect(rl('a').ok).toBe(true)
  })
})

describe('clientIp', () => {
  it('uses the RIGHTMOST x-forwarded-for entry (proxy-appended, not client-spoofed)', () => {
    // A client prepends a fake IP; the trusted proxy appends the real one last.
    expect(clientIp({ 'x-forwarded-for': '6.6.6.6, 5.6.7.8' })).toBe('5.6.7.8')
    expect(clientIp({ 'x-forwarded-for': ['6.6.6.6', '8.8.8.8'] })).toBe(
      '8.8.8.8',
    )
  })

  it("prefers Vercel's unspoofable header over a spoofed x-forwarded-for", () => {
    expect(
      clientIp({
        'x-vercel-forwarded-for': '203.0.113.9',
        'x-forwarded-for': 'spoof, spoof2',
      }),
    ).toBe('203.0.113.9')
  })

  it('falls back to x-real-ip, then the provided fallback', () => {
    expect(clientIp({ 'x-real-ip': '4.4.4.4' })).toBe('4.4.4.4')
    expect(clientIp({}, '127.0.0.1')).toBe('127.0.0.1')
    expect(clientIp({})).toBe('unknown')
  })
})
