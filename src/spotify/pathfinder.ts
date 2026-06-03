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

/** Pull the current `fetchPlaylist` persisted-query hash out of the web-player JS bundle. */
export function extractFetchPlaylistHash(bundleJs: string): string | null {
  const m = bundleJs.match(/"fetchPlaylist","query","([a-f0-9]{64})"/)
  return m ? m[1] : null
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

interface PathfinderItem {
  itemV2?: {
    data?: {
      uri?: string
      name?: string
      artists?: { items?: { profile?: { name?: string } }[] }
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
    })
  }
  return { total, tracks }
}
