// src/spotify/client.test.ts
import { describe, expect, it, vi } from 'vitest'
import { fetchPlaylistTracks, parsePlaylistId, parseYear } from './client'

describe('parsePlaylistId', () => {
  const ID = '37i9dQZF1DXcBWIGoYBM5M'
  it('parses url, uri, and bare id', () => {
    expect(
      parsePlaylistId(`https://open.spotify.com/playlist/${ID}?si=x`),
    ).toBe(ID)
    expect(parsePlaylistId(`spotify:playlist:${ID}`)).toBe(ID)
    expect(parsePlaylistId(ID)).toBe(ID)
  })
  it('returns null for junk', () => {
    expect(parsePlaylistId('not a playlist')).toBeNull()
    expect(parsePlaylistId('')).toBeNull()
  })
})

describe('parseYear', () => {
  it('reads the leading year from a release_date', () => {
    expect(parseYear('1975-10-31')).toBe(1975)
    expect(parseYear('1969')).toBe(1969)
    expect(parseYear('')).toBeNull()
  })
})

describe('fetchPlaylistTracks', () => {
  it('maps items to SpotifyTrack[] across pages', async () => {
    const page1 = {
      items: [
        {
          track: {
            id: 'T1',
            uri: 'spotify:track:T1',
            name: 'Song One',
            artists: [{ name: 'Artist A' }],
            album: { release_date: '1980-01-01' },
          },
        },
      ],
      next: 'https://api.spotify.com/v1/next-page',
    }
    const page2 = {
      items: [
        {
          track: {
            id: 'T2',
            uri: 'spotify:track:T2',
            name: 'Song Two',
            artists: [{ name: 'Artist B' }],
            album: { release_date: '1991' },
          },
        },
      ],
      next: null,
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 })

    const tracks = await fetchPlaylistTracks({
      playlistId: 'PL',
      accessToken: 'AT',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(tracks).toEqual([
      {
        id: 'T1',
        uri: 'spotify:track:T1',
        title: 'Song One',
        artist: 'Artist A',
        year: 1980,
      },
      {
        id: 'T2',
        uri: 'spotify:track:T2',
        title: 'Song Two',
        artist: 'Artist B',
        year: 1991,
      },
    ])
    // first call hits the playlist endpoint with a bearer token
    const [firstUrl, firstInit] = fetchImpl.mock.calls[0]
    expect(String(firstUrl)).toContain('/playlists/PL/items')
    expect(firstInit.headers.Authorization).toBe('Bearer AT')
  })

  it("lists the user's playlists across pages", async () => {
    const { fetchMyPlaylists } = await import('./client')
    const page1 = {
      items: [
        {
          id: 'P1',
          name: 'Mine',
          owner: { display_name: 'me' },
          tracks: { total: 120 },
        },
      ],
      next: 'https://api.spotify.com/v1/me/playlists?offset=50',
    }
    const page2 = {
      items: [
        {
          id: 'P2',
          name: 'Other',
          owner: { display_name: 'me' },
          tracks: { total: 5 },
        },
      ],
      next: null,
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 })
    const pls = await fetchMyPlaylists({
      accessToken: 'AT',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(pls).toEqual([
      { id: 'P1', name: 'Mine', ownerName: 'me', trackCount: 120 },
      { id: 'P2', name: 'Other', ownerName: 'me', trackCount: 5 },
    ])
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/me/playlists')
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer AT')
  })

  it('throws on a non-ok response, including the response body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'Insufficient client scope',
    })
    await expect(
      fetchPlaylistTracks({
        playlistId: 'PL',
        accessToken: 'AT',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/403 Insufficient client scope/)
  })
})
