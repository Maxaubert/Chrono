import type { Plugin } from 'vite'
import type { SpotifyTrack } from './src/spotify/types'
import {
  buildFetchPlaylistUrl,
  extractAnonToken,
  extractFetchPlaylistHash,
  parsePathfinderPage,
} from './src/spotify/pathfinder'

/**
 * Dev-server "backend" that reads a full public playlist via Spotify's internal
 * web-player GraphQL (pathfinder). Runs server-side (Node) so it avoids CORS and
 * the per-IP rate limit on the classic api.spotify.com endpoint. This is the
 * method non-Spotify apps use to read playlists without Extended Quota. It is
 * unofficial: it can break when Spotify updates (mitigated by auto-extracting
 * the query hash from the live bundle) and is technically against Spotify ToS.
 * A real deployment moves this to a proper backend.
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const PAGE_LIMIT = 100
const HOME = 'https://open.spotify.com/'

let cachedHash: string | null = null

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

/** Find the current fetchPlaylist hash from the live web-player bundle. */
async function loadHash(force = false): Promise<string> {
  if (cachedHash && !force) return cachedHash
  const home = await fetchText(HOME)
  const bundleUrl = home.match(
    /https:\/\/open\.spotifycdn\.com\/cdn\/build\/web-player\/web-player\.[^"']+\.js/,
  )?.[0]
  if (!bundleUrl) throw new Error('could not locate the web-player bundle')
  const hash = extractFetchPlaylistHash(await fetchText(bundleUrl))
  if (!hash) throw new Error('could not extract the fetchPlaylist hash')
  cachedHash = hash
  return hash
}

async function getAnonToken(playlistId: string): Promise<string> {
  const html = await fetchText(
    `https://open.spotify.com/embed/playlist/${playlistId}`,
  )
  const token = extractAnonToken(html)
  if (!token) throw new Error('no anonymous token on the embed page')
  return token
}

async function pathfinderPage(
  playlistId: string,
  offset: number,
  hash: string,
  token: string,
): Promise<Response> {
  const url = buildFetchPlaylistUrl({ playlistId, offset, limit: PAGE_LIMIT, hash })
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': UA,
      origin: 'https://open.spotify.com',
      referer: 'https://open.spotify.com/',
    },
  })
}

async function scrapeAllTracks(
  playlistId: string,
): Promise<{ tracks: SpotifyTrack[]; total: number }> {
  const token = await getAnonToken(playlistId)
  let hash = await loadHash()

  // First page, with one retry on a fresh hash in case the cached one went stale.
  let res = await pathfinderPage(playlistId, 0, hash, token)
  if (!res.ok) {
    hash = await loadHash(true)
    res = await pathfinderPage(playlistId, 0, hash, token)
  }
  if (!res.ok) throw new Error(`pathfinder first page -> ${res.status}`)

  const first = parsePathfinderPage(await res.json())
  const tracks = [...first.tracks]
  const total = first.total

  for (let offset = PAGE_LIMIT; offset < total; offset += PAGE_LIMIT) {
    const pageRes = await pathfinderPage(playlistId, offset, hash, token)
    if (!pageRes.ok) break // partial result rather than failing the whole import
    tracks.push(...parsePathfinderPage(await pageRes.json()).tracks)
  }
  return { tracks, total }
}

export function spotifyScraperPlugin(): Plugin {
  return {
    name: 'spotify-scraper',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/playlist-tracks')) return next()
        const id = new URL(req.url, 'http://localhost').searchParams.get('id')
        res.setHeader('content-type', 'application/json')
        if (!id) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'missing id' }))
          return
        }
        try {
          res.end(JSON.stringify(await scrapeAllTracks(id)))
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}
