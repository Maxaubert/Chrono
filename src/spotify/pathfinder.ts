import type { SpotifyTrack } from './types'

/**
 * Pure helpers for reading a public playlist through Spotify's internal
 * web-player GraphQL ("pathfinder"). This is how non-Spotify apps read full
 * playlists without Extended Quota: the same anonymous token + query the web
 * player itself uses. The query hash rotates when Spotify ships a new web
 * build, so it is extracted from the live bundle (see vite-plugin-spotify-
 * scraper.ts) rather than hardcoded. These functions stay pure/testable; the
 * network calls live in the Vite server middleware.
 */

const PATHFINDER = 'https://api-partner.spotify.com/pathfinder/v1/query'
const TRACK_PREFIX = 'spotify:track:'

/** Pull a named operation's persisted-query hash out of the web-player JS bundle. */
export function extractOperationHash(
  bundleJs: string,
  operationName: string,
): string | null {
  const m = bundleJs.match(
    new RegExp(`"${operationName}","query","([a-f0-9]{64})"`),
  )
  return m ? m[1] : null
}

/** Pull the current `fetchPlaylist` persisted-query hash out of the web-player JS bundle. */
export function extractFetchPlaylistHash(bundleJs: string): string | null {
  return extractOperationHash(bundleJs, 'fetchPlaylist')
}

/** Pull the anonymous web access token the embed page ships in its JSON. */
export function extractAnonToken(embedHtml: string): string | null {
  const m = embedHtml.match(/"accessToken":"([^"]+)"/)
  return m ? m[1] : null
}

/** Build a pathfinder GET URL for one page of a playlist's contents. */
export function buildFetchPlaylistUrl(args: {
  playlistId: string
  offset: number
  limit: number
  hash: string
  base?: string
}): string {
  const variables = JSON.stringify({
    uri: `spotify:playlist:${args.playlistId}`,
    offset: args.offset,
    limit: args.limit,
    enableWatchFeedEntrypoint: false,
  })
  const extensions = JSON.stringify({
    persistedQuery: { version: 1, sha256Hash: args.hash },
  })
  const base = args.base ?? PATHFINDER
  return (
    `${base}?operationName=fetchPlaylist` +
    `&variables=${encodeURIComponent(variables)}` +
    `&extensions=${encodeURIComponent(extensions)}`
  )
}

/** Build a pathfinder GET URL for a single track's metadata (includes the year). */
export function buildGetTrackUrl(args: {
  trackId: string
  hash: string
  base?: string
}): string {
  const variables = JSON.stringify({ uri: `spotify:track:${args.trackId}` })
  const extensions = JSON.stringify({
    persistedQuery: { version: 1, sha256Hash: args.hash },
  })
  const base = args.base ?? PATHFINDER
  return (
    `${base}?operationName=getTrack` +
    `&variables=${encodeURIComponent(variables)}` +
    `&extensions=${encodeURIComponent(extensions)}`
  )
}

/** Read the release year from a getTrack response, or null. */
export function parseTrackYear(json: unknown): number | null {
  const year = (
    json as {
      data?: { trackUnion?: { albumOfTrack?: { date?: { year?: number } } } }
    }
  )?.data?.trackUnion?.albumOfTrack?.date?.year
  return typeof year === 'number' ? year : null
}

/** Pick an album-cover URL near 300px (good for a card), or null. Shared by the
 *  pathfinder and Web-API track mappers, whose image lists have the same shape. */
export function pickCoverUrl(
  sources: { url?: string; width?: number | null }[] | undefined,
): string | null {
  const withUrl = (sources ?? []).filter((s) => s.url)
  if (!withUrl.length) return null
  const sorted = [...withUrl].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  const pick =
    sorted.find((s) => (s.width ?? 0) >= 280) ?? sorted[sorted.length - 1]
  return pick.url ?? null
}

interface PathfinderItem {
  itemV2?: {
    data?: {
      uri?: string
      name?: string
      artists?: { items?: { profile?: { name?: string } }[] }
      albumOfTrack?: {
        coverArt?: { sources?: { url?: string; width?: number | null }[] }
      }
    }
  }
}

interface PathfinderResponse {
  data?: {
    playlistV2?: {
      content?: { totalCount?: number; items?: PathfinderItem[] }
    }
  }
}

/** Map one pathfinder page to tracks + the playlist's total count. */
export function parsePathfinderPage(json: unknown): {
  total: number
  tracks: SpotifyTrack[]
} {
  const content = (json as PathfinderResponse)?.data?.playlistV2?.content
  const total = typeof content?.totalCount === 'number' ? content.totalCount : 0
  const tracks: SpotifyTrack[] = []
  for (const item of content?.items ?? []) {
    const d = item.itemV2?.data
    const uri = d?.uri
    if (!uri || !uri.startsWith(TRACK_PREFIX)) continue // skip local files / episodes
    const artist = (d.artists?.items ?? [])
      .map((a) => a.profile?.name)
      .filter(Boolean)
      .join(', ')
    tracks.push({
      id: uri.slice(TRACK_PREFIX.length),
      uri,
      title: d.name ?? '',
      artist,
      year: null, // fetchPlaylist does not include release year
      image: pickCoverUrl(d.albumOfTrack?.coverArt?.sources),
    })
  }
  return { total, tracks }
}
