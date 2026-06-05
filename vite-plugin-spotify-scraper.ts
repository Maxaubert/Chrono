import type { Plugin } from 'vite'
import { scrapeAllTracks, getTrackYear } from './server/spotifyScraper'

/**
 * Dev-server adapter over server/spotifyScraper.ts: serves /api/playlist-tracks
 * and /api/track-year so the browser can read a public playlist (and a track's
 * year) without CORS or the dev-mode 403. The same core powers the Vercel
 * serverless functions in api/, so dev and prod behave identically.
 */
export function spotifyScraperPlugin(): Plugin {
  return {
    name: 'spotify-scraper',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        const isTracks = url.startsWith('/api/playlist-tracks')
        const isYear = url.startsWith('/api/track-year')
        if (!isTracks && !isYear) return next()
        const id = new URL(url, 'http://localhost').searchParams.get('id')
        res.setHeader('content-type', 'application/json')
        if (!id) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'missing id' }))
          return
        }
        try {
          const payload = isYear
            ? { year: await getTrackYear(id) }
            : await scrapeAllTracks(id)
          res.end(JSON.stringify(payload))
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}
