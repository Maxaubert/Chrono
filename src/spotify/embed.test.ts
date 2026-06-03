import { describe, expect, it, vi } from 'vitest'
import {
  fetchAllPlaylistTracks,
  fetchPlaylistTracksViaEmbed,
  parseEmbedAccessToken,
  parseEmbedTracks,
} from './embed'

const FIXTURE = `<!doctype html><html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
  {
    props: {
      pageProps: {
        state: {
          data: {
            accessToken: 'WEB_TOKEN_123',
            entity: {
              trackList: [
                {
                  uri: 'spotify:track:AAA111',
                  title: 'Song A',
                  subtitle: 'Artist A',
                  entityType: 'track',
                },
                {
                  uri: 'spotify:track:BBB222',
                  title: 'Song B',
                  subtitle: 'Artist B, Artist C',
                  entityType: 'track',
                },
                {
                  uri: 'spotify:episode:ZZZ999',
                  title: 'An Episode',
                  subtitle: 'A Podcast',
                  entityType: 'episode',
                },
              ],
            },
          },
        },
      },
    },
  },
)}</script></body></html>`

describe('parseEmbedTracks', () => {
  it('extracts track id/uri/title/artist from the embed __NEXT_DATA__, skipping non-tracks', () => {
    expect(parseEmbedTracks(FIXTURE)).toEqual([
      {
        id: 'AAA111',
        uri: 'spotify:track:AAA111',
        title: 'Song A',
        artist: 'Artist A',
        year: null,
      },
      {
        id: 'BBB222',
        uri: 'spotify:track:BBB222',
        title: 'Song B',
        artist: 'Artist B, Artist C',
        year: null,
      },
    ])
  })

  it('throws when the embed format is not recognised', () => {
    expect(() => parseEmbedTracks('<html>no data here</html>')).toThrow(
      /__NEXT_DATA__/,
    )
  })
})

describe('fetchPlaylistTracksViaEmbed', () => {
  it('fetches the proxied embed path and parses tracks', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({ ok: true, text: async () => FIXTURE })
    const tracks = await fetchPlaylistTracksViaEmbed({
      playlistId: 'PL',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(tracks).toHaveLength(2)
    expect(String(fetchImpl.mock.calls[0][0])).toBe('/sp-embed/playlist/PL')
  })

  it('throws a helpful error when no tracks are found (likely a private playlist)', async () => {
    const empty = `<script id="__NEXT_DATA__" type="application/json">{}</script>`
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({ ok: true, text: async () => empty })
    await expect(
      fetchPlaylistTracksViaEmbed({
        playlistId: 'PL',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/public/)
  })
})

describe('parseEmbedAccessToken', () => {
  it('extracts the anonymous web token from the embed JSON', () => {
    expect(parseEmbedAccessToken(FIXTURE)).toBe('WEB_TOKEN_123')
  })
  it('returns null when no token is present', () => {
    expect(parseEmbedAccessToken('<html>nope</html>')).toBeNull()
  })
})

function apiTrack(id: string, year: string) {
  return {
    track: {
      id,
      uri: `spotify:track:${id}`,
      name: `Name ${id}`,
      artists: [{ name: `Artist ${id}` }],
      album: { release_date: year },
    },
  }
}

describe('fetchAllPlaylistTracks', () => {
  it('uses the embed token to page the API and returns tracks with years', async () => {
    const fetchImpl = vi
      .fn()
      // 1) embed page (token + 2 baseline tracks)
      .mockResolvedValueOnce({ ok: true, text: async () => FIXTURE })
      // 2) API page, offset 0
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 2,
          items: [apiTrack('X1', '1984-01-01'), apiTrack('X2', '2001')],
        }),
      })
    const result = await fetchAllPlaylistTracks({
      playlistId: 'PL',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(result.tracks).toEqual([
      {
        id: 'X1',
        uri: 'spotify:track:X1',
        title: 'Name X1',
        artist: 'Artist X1',
        year: 1984,
      },
      {
        id: 'X2',
        uri: 'spotify:track:X2',
        title: 'Name X2',
        artist: 'Artist X2',
        year: 2001,
      },
    ])
    expect(result.total).toBe(2)
    expect(result.complete).toBe(true)
    // second call is the API with offset=0 and a bearer token
    const [apiUrl, apiInit] = fetchImpl.mock.calls[1]
    expect(String(apiUrl)).toContain('/sp-api/v1/playlists/PL/tracks')
    expect(String(apiUrl)).toContain('offset=0')
    expect(apiInit.headers.Authorization).toBe('Bearer WEB_TOKEN_123')
  })

  it('pages through multiple offsets until all tracks are collected', async () => {
    const page1 = {
      total: 150,
      items: Array.from({ length: 100 }, (_, i) => apiTrack('A' + i, '1990')),
    }
    const page2 = {
      total: 150,
      items: Array.from({ length: 50 }, (_, i) => apiTrack('B' + i, '1991')),
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => FIXTURE })
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 })
    const result = await fetchAllPlaylistTracks({
      playlistId: 'PL',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: () => Promise.resolve(),
    })
    expect(result.tracks).toHaveLength(150)
    expect(result.total).toBe(150)
    expect(result.complete).toBe(true)
    expect(String(fetchImpl.mock.calls[2][0])).toContain('offset=100')
  })

  it('retries on 429 and falls back to the embed preview if it never clears', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => FIXTURE })
      // API stays rate-limited for every page attempt
      .mockResolvedValue({ ok: false, status: 429 })
    const result = await fetchAllPlaylistTracks({
      playlistId: 'PL',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleep: () => Promise.resolve(),
    })
    // it retried the page (more than just the one embed + one API call)
    expect(fetchImpl.mock.calls.length).toBeGreaterThan(2)
    // baseline from the embed (2 tracks, no year), flagged incomplete
    expect(result.tracks).toHaveLength(2)
    expect(result.tracks[0]).toMatchObject({ id: 'AAA111', year: null })
    expect(result.total).toBeNull()
    expect(result.complete).toBe(false)
  })
})
