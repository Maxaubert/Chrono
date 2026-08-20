// src/spotify/client.ts
import type { SpotifyTrack } from './types'

const API = 'https://api.spotify.com/v1'

export function parsePlaylistId(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  const m =
    s.match(/playlist[/:]([A-Za-z0-9]+)/) ??
    (/^[A-Za-z0-9]+$/.test(s) ? [s, s] : null)
  return m ? m[1] : null
}

export function parseYear(releaseDate: string): number | null {
  const m = releaseDate.match(/^(\d{4})/)
  return m ? Number(m[1]) : null
}

/** Read a full public playlist via our dev-server scraper (web-player GraphQL).
 * Works for any public playlist, paging past 100, without Extended Quota. */
export async function fetchPlaylistTracksViaServer(args: {
  playlistId: string
  fetchImpl?: typeof fetch
}): Promise<{ tracks: SpotifyTrack[]; total: number }> {
  const f = args.fetchImpl ?? fetch
  const res = await f(`/api/playlist-tracks?id=${args.playlistId}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Server import failed: ${res.status} ${body}`.trim())
  }
  return (await res.json()) as { tracks: SpotifyTrack[]; total: number }
}

/** Look up one track's release year via our dev-server (playlist import omits it).
 *  Returns null only when the API positively reports the track has no usable
 *  year; an infrastructure failure (429/5xx/network) throws instead, so callers
 *  can retry rather than silently discarding the track as year-less. */
export async function fetchTrackYear(args: {
  trackId: string
  fetchImpl?: typeof fetch
}): Promise<number | null> {
  const f = args.fetchImpl ?? fetch
  const res = await f(`/api/track-year?id=${args.trackId}`)
  if (!res.ok) throw new Error(`Year lookup failed: ${res.status}`)
  const data = (await res.json()) as { year?: number | null }
  return data.year ?? null
}

/** A playlist in the logged-in user's library (owned or followed). */
export interface MyPlaylist {
  id: string
  name: string
  ownerName: string
  trackCount: number
  /** Cover image URL, or null if the playlist has no cover. */
  image: string | null
}

interface RawPlaylist {
  id: string
  name: string
  owner: { display_name?: string }
  tracks: { total: number }
  images?: { url: string }[] | null
}

/** List the logged-in user's playlists. Allowed in development mode; track
 * lists are then imported via the server scraper (fetchPlaylistTracksViaServer). */
export async function fetchMyPlaylists(args: {
  accessToken: string
  fetchImpl?: typeof fetch
}): Promise<MyPlaylist[]> {
  const f = args.fetchImpl ?? fetch
  const headers = { Authorization: `Bearer ${args.accessToken}` }
  let url: string | null = `${API}/me/playlists?limit=50`
  const out: MyPlaylist[] = []
  while (url) {
    const res = await f(url, { headers })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Playlists fetch failed: ${res.status} ${body}`.trim())
    }
    const page = (await res.json()) as {
      items: (RawPlaylist | null)[]
      next: string | null
    }
    for (const p of page.items) {
      if (!p || !p.id) continue
      out.push({
        id: p.id,
        name: p.name,
        ownerName: p.owner?.display_name ?? '',
        trackCount: p.tracks?.total ?? 0,
        image: p.images?.[0]?.url ?? null,
      })
    }
    url = page.next
  }
  return out
}
