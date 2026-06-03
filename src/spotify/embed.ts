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
