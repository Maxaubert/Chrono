/**
 * Small in-memory sliding-window rate limiter for the public scrape endpoints.
 * Keyed by client IP. Note: serverless functions are per-instance, so this caps
 * traffic per warm instance, not globally across the fleet -- proportionate for a
 * hobby app serving only public data. For hard distributed limits, back it with
 * Vercel KV / Upstash or use the Vercel Firewall (see DEPLOY.md).
 */

export interface RateLimitResult {
  ok: boolean
  /** Milliseconds until the oldest hit in the window expires (0 when allowed). */
  retryAfterMs: number
}

export function createRateLimiter(opts: {
  limit: number
  windowMs: number
  now?: () => number
}): (key: string) => RateLimitResult {
  const { limit, windowMs } = opts
  const now = opts.now ?? Date.now
  const hits = new Map<string, number[]>()

  return function check(key: string): RateLimitResult {
    const t = now()
    const cutoff = t - windowMs
    const recent = (hits.get(key) ?? []).filter((ts) => ts > cutoff)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return { ok: false, retryAfterMs: recent[0] + windowMs - t }
    }
    recent.push(t)
    hits.set(key, recent)
    // Opportunistically drop fully-expired keys so memory stays bounded.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every((ts) => ts <= cutoff)) hits.delete(k)
      }
    }
    return { ok: true, retryAfterMs: 0 }
  }
}

type Headers = Record<string, string | string[] | undefined>

/**
 * Client IP for rate-limit keying, resistant to spoofing. A client can put any
 * value at the FRONT of `x-forwarded-for`, so trusting the leftmost entry would
 * let an attacker mint a fresh bucket per request and bypass the limiter.
 * Precedence:
 *   1. `x-vercel-forwarded-for` — injected by Vercel's edge, clients can't override.
 *   2. the RIGHTMOST `x-forwarded-for` entry — appended by the proxy closest to us.
 *   3. `x-real-ip`, then the caller-supplied fallback (dev socket address).
 */
export function clientIp(headers: Headers, fallback = 'unknown'): string {
  const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.split(',')[0].trim()

  const vercel = first(headers['x-vercel-forwarded-for'])
  if (vercel) return vercel

  const xff = headers['x-forwarded-for']
  const parts = (Array.isArray(xff) ? xff.join(',') : (xff ?? ''))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length) return parts[parts.length - 1]

  return first(headers['x-real-ip']) ?? fallback
}

/** Shared policy for the scrape endpoints: 40 requests / minute per IP -- well
 * above real gameplay (one import + ~1 year lookup per turn), blocks hammering. */
export const apiRateLimit = createRateLimiter({ limit: 40, windowMs: 60_000 })
