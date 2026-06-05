import { describe, expect, it } from 'vitest'
import {
  buildFetchPlaylistUrl,
  buildGetTrackUrl,
  extractAnonToken,
  extractOperationHash,
  parsePathfinderPage,
  parseTrackMeta,
  parseTrackYear,
} from './pathfinder'

const HASH = 'a65e12194ed5fc443a1cdebed5fabe33ca5b07b987185d63c72483867ad13cb4'

describe('extractOperationHash', () => {
  it('extracts any named operation hash', () => {
    const js = `new i.l("getTrack","query","612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294",null)`
    expect(extractOperationHash(js, 'getTrack')).toBe(
      '612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294',
    )
    expect(extractOperationHash(js, 'getAlbum')).toBeNull()
  })
})

describe('buildGetTrackUrl', () => {
  it('encodes the track uri and hash', () => {
    const url = new URL(buildGetTrackUrl({ trackId: 'T1', hash: HASH }))
    expect(url.searchParams.get('operationName')).toBe('getTrack')
    expect(JSON.parse(url.searchParams.get('variables')!)).toEqual({
      uri: 'spotify:track:T1',
    })
    expect(
      JSON.parse(url.searchParams.get('extensions')!).persistedQuery.sha256Hash,
    ).toBe(HASH)
  })
})

describe('parseTrackYear', () => {
  it('reads the year from a getTrack response', () => {
    expect(
      parseTrackYear({
        data: { trackUnion: { albumOfTrack: { date: { year: 2007 } } } },
      }),
    ).toBe(2007)
  })
  it('returns null when absent', () => {
    expect(parseTrackYear({ data: { trackUnion: {} } })).toBeNull()
    expect(parseTrackYear({})).toBeNull()
  })
})

describe('parseTrackMeta', () => {
  it('reads title, primary artists, and year from a getTrack response', () => {
    expect(
      parseTrackMeta({
        data: {
          trackUnion: {
            name: 'Bohemian Rhapsody',
            artists: { items: [{ profile: { name: 'Queen' } }] },
            albumOfTrack: { date: { year: 2018 } },
          },
        },
      }),
    ).toEqual({ year: 2018, title: 'Bohemian Rhapsody', artist: 'Queen' })
  })
  it('tolerates missing fields', () => {
    expect(parseTrackMeta({ data: { trackUnion: {} } })).toEqual({
      year: null,
      title: null,
      artist: null,
    })
    expect(parseTrackMeta({})).toEqual({
      year: null,
      title: null,
      artist: null,
    })
  })
})

describe('extractAnonToken', () => {
  it('extracts the anonymous token', () => {
    expect(extractAnonToken('x"accessToken":"BQ_TOKEN_123"y')).toBe(
      'BQ_TOKEN_123',
    )
  })
})

describe('buildFetchPlaylistUrl', () => {
  it('encodes operation, variables and the hash', () => {
    const url = new URL(
      buildFetchPlaylistUrl({
        playlistId: 'PL',
        offset: 100,
        limit: 100,
        hash: HASH,
      }),
    )
    expect(url.origin + url.pathname).toBe(
      'https://api-partner.spotify.com/pathfinder/v1/query',
    )
    expect(url.searchParams.get('operationName')).toBe('fetchPlaylist')
    const vars = JSON.parse(url.searchParams.get('variables')!)
    expect(vars).toEqual({
      uri: 'spotify:playlist:PL',
      offset: 100,
      limit: 100,
      enableWatchFeedEntrypoint: false,
    })
    const ext = JSON.parse(url.searchParams.get('extensions')!)
    expect(ext.persistedQuery.sha256Hash).toBe(HASH)
  })
})

describe('parsePathfinderPage', () => {
  it('maps items to tracks and reads totalCount, skipping non-tracks', () => {
    const json = {
      data: {
        playlistV2: {
          content: {
            totalCount: 512,
            items: [
              {
                itemV2: {
                  data: {
                    uri: 'spotify:track:T1',
                    name: 'Carry You Home',
                    artists: { items: [{ profile: { name: 'James Blunt' } }] },
                    albumOfTrack: {
                      coverArt: {
                        sources: [
                          { url: 'https://i/64', width: 64 },
                          { url: 'https://i/300', width: 300 },
                          { url: 'https://i/640', width: 640 },
                        ],
                      },
                    },
                  },
                },
              },
              {
                itemV2: {
                  data: {
                    uri: 'spotify:track:T2',
                    name: 'Duet',
                    artists: {
                      items: [
                        { profile: { name: 'A' } },
                        { profile: { name: 'B' } },
                      ],
                    },
                  },
                },
              },
              { itemV2: { data: { uri: 'spotify:local:xyz', name: 'Local' } } },
            ],
          },
        },
      },
    }
    expect(parsePathfinderPage(json)).toEqual({
      total: 512,
      tracks: [
        {
          id: 'T1',
          uri: 'spotify:track:T1',
          title: 'Carry You Home',
          artist: 'James Blunt',
          year: null,
          image: 'https://i/300',
        },
        {
          id: 'T2',
          uri: 'spotify:track:T2',
          title: 'Duet',
          artist: 'A, B',
          year: null,
          image: null,
        },
      ],
    })
  })

  it('returns empty for an unexpected shape', () => {
    expect(parsePathfinderPage({})).toEqual({ total: 0, tracks: [] })
  })
})
