import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isSpotifyId, scrapeAllTracks } from '../server/spotifyScraper'
import { apiRateLimit, clientIp } from '../server/rateLimit'

/** GET /api/playlist-tracks?id=<playlistId> -> { tracks, total }. The production
 * equivalent of the Vite dev plugin's middleware (same shared scraper core). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rl = apiRateLimit(clientIp(req.headers))
  if (!rl.ok) {
    res.setHeader('Retry-After', Math.ceil(rl.retryAfterMs / 1000))
    return res.status(429).json({ error: 'rate limited' })
  }
  const { id } = req.query
  if (!isSpotifyId(id)) return res.status(400).json({ error: 'bad id' })
  try {
    res.status(200).json(await scrapeAllTracks(id))
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
}
