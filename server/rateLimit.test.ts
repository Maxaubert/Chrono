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
  it('reads the first x-forwarded-for address', () => {
    expect(clientIp({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('1.2.3.4')
    expect(clientIp({ 'x-forwarded-for': ['9.9.9.9', '8.8.8.8'] })).toBe(
      '9.9.9.9',
    )
  })

  it('falls back to x-real-ip, then the provided fallback', () => {
    expect(clientIp({ 'x-real-ip': '4.4.4.4' })).toBe('4.4.4.4')
    expect(clientIp({}, '127.0.0.1')).toBe('127.0.0.1')
    expect(clientIp({})).toBe('unknown')
  })
})
