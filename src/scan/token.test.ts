import { describe, expect, it } from 'vitest'
import {
  encodeTrackToken,
  decodeTrackToken,
  trackIdToUri,
  trackIdToOpenUrl,
} from './token'

const ID = '3n3Ppam7vgaVa1iaRUc9Lp'

describe('track token codec', () => {
  it('encodes a track id to a chrono token', () => {
    expect(encodeTrackToken(ID)).toBe(`chrono:t:${ID}`)
  })

  it('round-trips encode -> decode', () => {
    expect(decodeTrackToken(encodeTrackToken(ID))).toBe(ID)
  })

  it('returns null for non-chrono text', () => {
    expect(decodeTrackToken('https://open.spotify.com/track/' + ID)).toBeNull()
    expect(decodeTrackToken('chrono:t:')).toBeNull()
    expect(decodeTrackToken('chrono:t:has space')).toBeNull()
    expect(decodeTrackToken('')).toBeNull()
  })

  it('maps a track id to a spotify uri AudioTrackRef', () => {
    expect(trackIdToUri(ID)).toEqual({ uri: `spotify:track:${ID}` })
  })

  it('maps a track id to an open.spotify.com deep link', () => {
    expect(trackIdToOpenUrl(ID)).toBe(`https://open.spotify.com/track/${ID}`)
  })
})
