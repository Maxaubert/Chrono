import type { VercelRequest, VercelResponse } from '@vercel/node'
import { scrapeAllTracks } from '../server/spotifyScraper'

/** GET /api/playlist-tracks?id=<playlistId> -> { tracks, total }. The production
 * equivalent of the Vite dev plugin's middleware (same shared scraper core). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : null
  if (!id) return res.status(400).json({ error: 'missing id' })
  try {
    res.status(200).json(await scrapeAllTracks(id))
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
}
