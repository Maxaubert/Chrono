import { describe, expect, it, vi } from 'vitest'
import { fetchPlaylistTracksViaEmbed, parseEmbedTracks } from './embed'

const FIXTURE = `<!doctype html><html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
  {
    props: {
      pageProps: {
        state: {
          data: {
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
