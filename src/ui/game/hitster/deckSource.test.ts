import { describe, expect, it } from 'vitest'
import type { SpotifyTrack } from '@/spotify'
import { makeHitsterDeck } from './deckSource'

const track = (id: string, year: number): SpotifyTrack => ({
  id,
  uri: `spotify:track:${id}`,
  title: `T-${id}`,
  artist: `A-${id}`,
  year,
  image: null,
})

describe('makeHitsterDeck', () => {
  it('pops DrawnCards in shuffled order, resolving each year', async () => {
    const tracks = [track('a', 1990), track('b', 1991), track('c', 1992)]
    const fetchYear = async (id: string) =>
      tracks.find((t) => t.id === id)!.year as number
    const handle = makeHitsterDeck(tracks, fetchYear, () => 0)
    const first = await handle.next()
    expect(first).not.toBeNull()
    expect(first!.card).toMatchObject({ year: expect.any(Number) })
    expect(first!.reveal.title).toMatch(/^T-/)
  })

  it('skips tracks whose year cannot be resolved', async () => {
    const tracks = [track('a', 1990), track('b', 1991)]
    const fetchYear = async (id: string) => (id === 'a' ? null : 1991)
    const handle = makeHitsterDeck(tracks, fetchYear, () => 0)
    const drawn = await handle.next()
    expect(drawn!.card.id).toBe('b')
  })

  it('returns null when the deck is exhausted', async () => {
    const handle = makeHitsterDeck(
      [],
      async () => null,
      () => 0,
    )
    expect(await handle.next()).toBeNull()
  })
})
