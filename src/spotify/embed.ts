import { parseYear } from './client'
import type { SpotifyTrack } from './types'

/**
 * Read a public playlist's tracks from Spotify's public embed page instead of
 * the Web API. Apps in Spotify "development mode" are blocked (403) from the
 * playlist-items Web API endpoint even for the user's own playlists, and the
 * Extended Quota mode that lifts this is not available to hobby projects. The
 * embed page (open.spotify.com/embed/playlist/<id>) is public, needs no token,
 * and carries the full track list in a __NEXT_DATA__ JSON blob.
 *
 * Limitations: only PUBLIC playlists render here, and there is no release year
 * in the embed data (year is out of scope for this spike). In the browser this
 * is fetched through a dev-server proxy (see vite.config.ts) to avoid CORS; a
 * real backend replaces that proxy in a later phase.
 */

const EMBED_PROXY_BASE = '/sp-embed'
const TRACK_PREFIX = 'spotify:track:'

/** Recursively find the first `trackList` array anywhere in the parsed JSON. */
function findTrackList(node: unknown): unknown[] | null {
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (Array.isArray(obj.trackList)) return obj.trackList
    for (const key of Object.keys(obj)) {
      const found = findTrackList(obj[key])
      if (found) return found
    }
  }
  return null
}

/** Parse the embed HTML into tracks. Throws if the page is not in the expected shape. */
export function parseEmbedTracks(html: string): SpotifyTrack[] {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )
  if (!match) {
    throw new Error('Playlist embed format not recognised (no __NEXT_DATA__).')
  }
  const data: unknown = JSON.parse(match[1])
  const list = findTrackList(data) ?? []
  const out: SpotifyTrack[] = []
  for (const raw of list) {
    const t = raw as Record<string, unknown>
    const uri = typeof t.uri === 'string' ? t.uri : ''
    if (!uri.startsWith(TRACK_PREFIX)) continue
    out.push({
      id: uri.slice(TRACK_PREFIX.length),
      uri,
      title: typeof t.title === 'string' ? t.title : '',
      artist: typeof t.subtitle === 'string' ? t.subtitle : '',
      year: null,
    })
  }
  return out
}

/** Fetch + parse a public playlist's tracks via the embed page. No token needed. */
export async function fetchPlaylistTracksViaEmbed(args: {
  playlistId: string
  fetchImpl?: typeof fetch
  basePath?: string
}): Promise<SpotifyTrack[]> {
  const f = args.fetchImpl ?? fetch
  const base = args.basePath ?? EMBED_PROXY_BASE
  const res = await f(`${base}/playlist/${args.playlistId}`)
  if (!res.ok) throw new Error(`Playlist embed fetch failed: ${res.status}`)
  const tracks = parseEmbedTracks(await res.text())
  if (tracks.length === 0) {
    throw new Error('No tracks found. Is the playlist public?')
  }
  return tracks
}

const API_PROXY_BASE = '/sp-api'
const PAGE_LIMIT = 100
const TRACK_FIELDS =
  'total,items(track(id,uri,name,artists(name),album(release_date)))'

/** Pull the anonymous web access token the embed page ships in its JSON. This
 * token belongs to Spotify's own web client, not our development-mode app, so
 * it is not subject to the 403 block on the playlist-items Web API endpoint. */
export function parseEmbedAccessToken(html: string): string | null {
  const m = html.match(/"accessToken":"([^"]+)"/)
  return m ? m[1] : null
}

interface ApiTracksPage {
  total: number
  items: {
    track: {
      id: string
      uri: string
      name: string
      artists: { name: string }[]
      album: { release_date: string }
    } | null
  }[]
}

function mapApiItem(item: ApiTracksPage['items'][number]): SpotifyTrack | null {
  const t = item.track
  if (!t || !t.id) return null
  return {
    id: t.id,
    uri: t.uri,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    year: parseYear(t.album?.release_date ?? ''),
  }
}

export interface PlaylistImport {
  tracks: SpotifyTrack[]
  /** The playlist's true track count from the API, or null if the API never responded. */
  total: number | null
  /** True when every track was fetched (not cut short by a rate limit). */
  complete: boolean
  /** HTTP status of the last paged-API response (e.g. 429), or null if no token / not called. */
  apiStatus: number | null
}

const PAGE_DELAY_MS = 500
const MAX_RETRIES = 4

/**
 * Fetch ALL of a public playlist's tracks: grab the anonymous token from the
 * embed page, then page through the tracks endpoint (offset/limit) with it.
 * Reports the true `total` and whether the fetch was `complete`, so a partial
 * result (e.g. cut short by a rate limit) is never mistaken for the whole list.
 * Falls back to the embed's 100-track preview if the paged API never responds.
 */
export async function fetchAllPlaylistTracks(args: {
  playlistId: string
  fetchImpl?: typeof fetch
  embedBase?: string
  apiBase?: string
  sleep?: (ms: number) => Promise<void>
}): Promise<PlaylistImport> {
  const f = args.fetchImpl ?? fetch
  const sleep = args.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)))
  const embedBase = args.embedBase ?? EMBED_PROXY_BASE
  const apiBase = args.apiBase ?? API_PROXY_BASE

  const embedRes = await f(`${embedBase}/playlist/${args.playlistId}`)
  if (!embedRes.ok) {
    throw new Error(`Playlist embed fetch failed: ${embedRes.status}`)
  }
  const html = await embedRes.text()
  const baseline = parseEmbedTracks(html) // up to 100, no year, used as fallback
  const token = parseEmbedAccessToken(html)
  let apiStatus: number | null = null

  if (token) {
    const headers = { Authorization: `Bearer ${token}` }
    // Fetch one page, retrying on 429 (honouring Retry-After) so a transient
    // rate limit is waited out rather than giving up immediately.
    const fetchPage = async (offset: number): Promise<Response | null> => {
      const url =
        `${apiBase}/v1/playlists/${args.playlistId}/tracks` +
        `?offset=${offset}&limit=${PAGE_LIMIT}&fields=${encodeURIComponent(TRACK_FIELDS)}`
      for (let attempt = 0; ; attempt++) {
        const res = await f(url, { headers })
        if (res.status !== 429 || attempt >= MAX_RETRIES) return res
        const retryAfter = Number(res.headers?.get?.('Retry-After'))
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 10_000)
            : Math.min((attempt + 1) * 2000, 8000)
        await sleep(waitMs)
      }
    }

    const all: SpotifyTrack[] = []
    let total: number | null = null
    let offset = 0
    while (true) {
      const res = await fetchPage(offset)
      if (res) apiStatus = res.status
      if (!res || !res.ok) break // still rate-limited after retries, or unavailable
      const page = (await res.json()) as ApiTracksPage
      total = page.total ?? total
      for (const item of page.items ?? []) {
        const mapped = mapApiItem(item)
        if (mapped) all.push(mapped)
      }
      offset += PAGE_LIMIT
      if (!page.items?.length || offset >= (page.total ?? 0)) break
      await sleep(PAGE_DELAY_MS) // gentle pacing so a big playlist does not trip rate limits
    }
    // Prefer the paged API result (full list + release years) whenever it got
    // anything; fall back to the embed preview only if it returned nothing.
    if (all.length > 0) {
      return {
        tracks: all,
        total,
        complete: total != null && all.length >= total,
        apiStatus,
      }
    }
  }

  if (baseline.length === 0) {
    throw new Error('No tracks found. Is the playlist public?')
  }
  return { tracks: baseline, total: null, complete: false, apiStatus }
}
