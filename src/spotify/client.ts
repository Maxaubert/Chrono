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

interface RawItem {
  track: {
    id: string
    uri: string
    name: string
    artists: { name: string }[]
    album: { release_date: string }
  } | null
}

export function mapTrack(item: RawItem): SpotifyTrack | null {
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

export async function fetchPlaylistTracks(args: {
  playlistId: string
  accessToken: string
  fetchImpl?: typeof fetch
}): Promise<SpotifyTrack[]> {
  const f = args.fetchImpl ?? fetch
  const headers = { Authorization: `Bearer ${args.accessToken}` }
  // Spotify renamed /tracks -> /items in Feb 2026; the new endpoint is the
  // sanctioned one and may behave differently from the (forbidden) /tracks.
  let url: string | null = `${API}/playlists/${args.playlistId}/items?limit=100`
  const out: SpotifyTrack[] = []
  while (url) {
    const res = await f(url, { headers })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Playlist fetch failed: ${res.status} ${body}`.trim())
    }
    const page = (await res.json()) as { items: RawItem[]; next: string | null }
    for (const item of page.items) {
      const mapped = mapTrack(item)
      if (mapped) out.push(mapped)
    }
    url = page.next
  }
  return out
}

/** A playlist in the logged-in user's library (owned or followed). */
export interface MyPlaylist {
  id: string
  name: string
  ownerName: string
  trackCount: number
}

interface RawPlaylist {
  id: string
  name: string
  owner: { display_name?: string }
  tracks: { total: number }
}

/** List the logged-in user's playlists. Allowed in development mode, and a
 * playlist the user owns returns its full track list via fetchPlaylistTracks. */
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
      })
    }
    url = page.next
  }
  return out
}
