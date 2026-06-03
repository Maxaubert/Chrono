import { describe, expect, it } from 'vitest'
import { buildDeck } from './deck'
import type { SpotifyTrack } from '@/spotify'

const track = (id: string): SpotifyTrack => ({
  id,
  uri: `spotify:track:${id}`,
  title: `t-${id}`,
  artist: `a-${id}`,
  year: null,
})

describe('buildDeck', () => {
  it('returns a permutation of the input using the injected rng', () => {
    const tracks = ['1', '2', '3', '4'].map(track)
    // rng returns 0 every time -> Fisher-Yates swaps each index with index 0
    const deck = buildDeck(tracks, () => 0)
    expect(deck.map((t) => t.id).sort()).toEqual(['1', '2', '3', '4'])
    expect(deck).toHaveLength(4)
    // does not mutate the input
    expect(tracks.map((t) => t.id)).toEqual(['1', '2', '3', '4'])
  })
})
