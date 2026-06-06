import type { SpotifyTrack } from '../src/spotify/types.js'
import {
  buildFetchPlaylistUrl,
  buildGetTrackUrl,
  extractAnonToken,
  extractOperationHash,
  parsePathfinderPage,
  parseTrackMeta,
} from '../src/spotify/pathfinder.js'
import {
  earliestItunesYear,
  reconcileYear,
  type ItunesSong,
} from '../src/spotify/itunesYear.js'

/**
 * Framework-agnostic "backend" that reads a full public playlist via Spotify's
 * internal web-player GraphQL (pathfinder). Runs server-side (Node) so it avoids
 * CORS and the per-IP rate limit on the classic api.spotify.com endpoint. This is
 * how non-Spotify apps read playlists without Extended Quota. It is unofficial: it
 * can break when Spotify updates (mitigated by auto-extracting the query hash from
 * the live bundle) and is technically against Spotify ToS.
 *
 * Both the Vite dev plugin (vite-plugin-spotify-scraper.ts) and the Vercel
 * serverless functions (api/) import scrapeAllTracks / getTrackYear from here, so
 * dev and prod behave identically.
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const PAGE_LIMIT = 100
const HOME = 'https://open.spotify.com/'
/** Hard cap on tracks read per request, so a huge (or hostile) playlist can't
 * turn one unauthenticated call into an unbounded fan-out of upstream fetches. */
const MAX_TRACKS = 1000

/** Spotify resource ids are 22-char base62. Validating before any id is
 * interpolated into a URL closes off SSRF / path-injection on these public,
 * unauthenticated endpoints (e.g. an id of `../../foo` or a full URL). */
export function isSpotifyId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9]{22}$/.test(id)
}

let cachedBundle: string | null = null
const hashCache: Record<string, string> = {}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

/** The current web-player JS bundle (cached; carries the operation hashes). */
async function loadBundle(force = false): Promise<string> {
  if (cachedBundle && !force) return cachedBundle
  const home = await fetchText(HOME)
  const bundleUrl = home.match(
    /https:\/\/open\.spotifycdn\.com\/cdn\/build\/web-player\/web-player\.[^"']+\.js/,
  )?.[0]
  if (!bundleUrl) throw new Error('could not locate the web-player bundle')
  cachedBundle = await fetchText(bundleUrl)
  return cachedBundle
}

/** Current persisted-query hash for an operation, auto-extracted from the live
 * bundle and cached. `force` re-downloads the bundle (used when a hash rotates). */
async function loadHash(operationName: string, force = false): Promise<string> {
  if (hashCache[operationName] && !force) return hashCache[operationName]
  const hash = extractOperationHash(await loadBundle(force), operationName)
  if (!hash) throw new Error(`could not extract the ${operationName} hash`)
  hashCache[operationName] = hash
  return hash
}

/** Any embed page hands out an anonymous web token usable for pathfinder. */
async function getAnonToken(
  kind: 'playlist' | 'track',
  id: string,
): Promise<string> {
  const html = await fetchText(`https://open.spotify.com/embed/${kind}/${id}`)
  const token = extractAnonToken(html)
  if (!token) throw new Error('no anonymous token on the embed page')
  return token
}

function pathfinderHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'User-Agent': UA,
    origin: 'https://open.spotify.com',
    referer: 'https://open.spotify.com/',
  }
}

/** Fetch one page. `ok` is true only when the body actually contains playlist
 * content, so a stale hash (which can come back as HTTP 200 with an error body,
 * not just an HTTP error) is detected and can trigger a hash refresh. */
async function pathfinderPage(
  playlistId: string,
  offset: number,
  hash: string,
  token: string,
): Promise<{ ok: boolean; json: unknown; status: number }> {
  const url = buildFetchPlaylistUrl({
    playlistId,
    offset,
    limit: PAGE_LIMIT,
    hash,
  })
  const res = await fetch(url, { headers: pathfinderHeaders(token) })
  const json = res.ok ? await res.json().catch(() => null) : null
  const hasContent = !!(
    json as { data?: { playlistV2?: { content?: unknown } } }
  )?.data?.playlistV2?.content
  return { ok: hasContent, json, status: res.status }
}

export async function scrapeAllTracks(
  playlistId: string,
): Promise<{ tracks: SpotifyTrack[]; total: number }> {
  if (!isSpotifyId(playlistId)) throw new Error('invalid playlist id')
  const token = await getAnonToken('playlist', playlistId)
  let hash = await loadHash('fetchPlaylist')

  // First page; if it fails (HTTP error OR an error body from a rotated hash),
  // refresh the hash from the live bundle and retry once.
  let first = await pathfinderPage(playlistId, 0, hash, token)
  if (!first.ok) {
    hash = await loadHash('fetchPlaylist', true)
    first = await pathfinderPage(playlistId, 0, hash, token)
  }
  if (!first.ok) {
    throw new Error(`pathfinder first page failed (status ${first.status})`)
  }

  const parsed = parsePathfinderPage(first.json)
  const tracks = [...parsed.tracks]
  const total = parsed.total

  // Bounded fan-out: never page past MAX_TRACKS regardless of the playlist size.
  const limit = Math.min(total, MAX_TRACKS)
  for (
    let offset = PAGE_LIMIT;
    offset < limit && tracks.length < MAX_TRACKS;
    offset += PAGE_LIMIT
  ) {
    const page = await pathfinderPage(playlistId, offset, hash, token)
    if (!page.ok) break // partial result rather than failing the whole import
    tracks.push(...parsePathfinderPage(page.json).tracks)
  }
  return { tracks: tracks.slice(0, MAX_TRACKS), total }
}

/** Best-effort original release year from iTunes for an artist + title, or null.
 * Recovers the year when Spotify reports a reissue/remaster; any failure (miss,
 * rate-limit, network) returns null so the caller falls back to the Spotify year. */
async function itunesOriginalYear(
  artist: string | null,
  title: string,
): Promise<number | null> {
  const term = [artist?.split(',')[0], title].filter(Boolean).join(' ').trim()
  if (!term) return null
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`,
    )
    if (!res.ok) return null
    const data = (await res.json()) as { results?: ItunesSong[] }
    return earliestItunesYear(data.results ?? [], {
      artist: artist ?? '',
      title,
    })
  } catch {
    return null
  }
}

/** A single track's original release year. Spotify's date is often a reissue /
 * remaster year, so it is reconciled against the earliest matching iTunes year. */
export async function getTrackYear(trackId: string): Promise<number | null> {
  if (!isSpotifyId(trackId)) throw new Error('invalid track id')
  const token = await getAnonToken('track', trackId)
  const request = async (hash: string) =>
    fetch(buildGetTrackUrl({ trackId, hash }), {
      headers: pathfinderHeaders(token),
    })
  let meta: ReturnType<typeof parseTrackMeta> = {
    year: null,
    title: null,
    artist: null,
  }
  for (const force of [false, true]) {
    const hash = await loadHash('getTrack', force)
    const res = await request(hash)
    const json = res.ok ? await res.json().catch(() => null) : null
    const m = parseTrackMeta(json)
    if (m.year != null || m.title) {
      meta = m
      break
    }
  }
  const itunes = meta.title
    ? await itunesOriginalYear(meta.artist, meta.title)
    : null
  return reconcileYear(meta.year, itunes)
}
