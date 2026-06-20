import { describe, expect, it } from 'vitest'
import { buildDeck, takeNextDrawn } from './deck'
import type { SpotifyTrack } from '@/spotify'

const track = (id: string): SpotifyTrack => ({
  id,
  uri: `spotify:track:${id}`,
  title: `t-${id}`,
  artist: `a-${id}`,
  year: null,
  image: null,
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

describe('takeNextDrawn', () => {
  it('draws the first track, fetching its year', async () => {
    const tracks = ['1', '2'].map(track)
    const fetchYear = async (id: string) => (id === '1' ? 1991 : 2001)
    const { drawn, remaining } = await takeNextDrawn(tracks, fetchYear)
    expect(drawn).toEqual({
      card: { id: '1', year: 1991 },
      reveal: { title: 't-1', subtitle: 'a-1', year: 1991 },
    })
    expect(remaining.map((t) => t.id)).toEqual(['2'])
  })

  it('skips tracks whose year cannot be fetched', async () => {
    const tracks = ['1', '2'].map(track)
    const fetchYear = async (id: string) => (id === '1' ? null : 2001)
    const { drawn, remaining } = await takeNextDrawn(tracks, fetchYear)
    expect(drawn?.card).toEqual({ id: '2', year: 2001 })
    expect(remaining).toHaveLength(0)
  })

  it('returns null when no track yields a year', async () => {
    const tracks = ['1'].map(track)
    const { drawn, remaining } = await takeNextDrawn(tracks, async () => null)
    expect(drawn).toBeNull()
    expect(remaining).toHaveLength(0)
  })
})
