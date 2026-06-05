import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTrackYear, isSpotifyId } from '../server/spotifyScraper'

/** GET /api/track-year?id=<trackId> -> { year }. The production equivalent of the
 * Vite dev plugin's middleware (same shared scraper core). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  if (!isSpotifyId(id)) return res.status(400).json({ error: 'bad id' })
  try {
    res.status(200).json({ year: await getTrackYear(id) })
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
}
