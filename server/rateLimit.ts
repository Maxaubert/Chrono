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

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers, fallback = 'unknown'): string {
  const pick = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.split(',')[0].trim()
  return (
    pick(headers['x-forwarded-for']) ?? pick(headers['x-real-ip']) ?? fallback
  )
}

/** Shared policy for the scrape endpoints: 40 requests / minute per IP -- well
 * above real gameplay (one import + ~1 year lookup per turn), blocks hammering. */
export const apiRateLimit = createRateLimiter({ limit: 40, windowMs: 60_000 })
