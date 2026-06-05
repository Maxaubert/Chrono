import { describe, expect, it } from 'vitest'
import { earliestItunesYear, reconcileYear } from './itunesYear'

const bohemian = [
  {
    kind: 'song',
    trackName: 'Bohemian Rhapsody',
    artistName: 'Queen',
    releaseDate: '1975-10-31T12:00:00Z',
  },
  {
    kind: 'song',
    trackName: 'Bohemian Rhapsody (Live)',
    artistName: 'Queen',
    releaseDate: '1992-01-01T12:00:00Z',
  },
  {
    kind: 'song',
    trackName: 'Bohemian Rhapsody (2011 Mix)',
    artistName: 'Queen',
    releaseDate: '2011-01-01T12:00:00Z',
  },
  // a different song + a cover by another artist that must NOT count
  {
    kind: 'song',
    trackName: 'Killer Queen',
    artistName: 'Queen',
    releaseDate: '1974-01-01T12:00:00Z',
  },
  {
    kind: 'song',
    trackName: 'Bohemian Rhapsody',
    artistName: 'Panic! At The Disco',
    releaseDate: '1969-01-01T12:00:00Z',
  },
]

describe('earliestItunesYear', () => {
  it('recovers the earliest original year for the matching song + artist', () => {
    expect(
      earliestItunesYear(bohemian, {
        artist: 'Queen',
        title: 'Bohemian Rhapsody',
      }),
    ).toBe(1975)
  })

  it('ignores different songs and covers by other artists', () => {
    // the 1974 "Killer Queen" and the 1969 cover are excluded, so not 1974/1969
    expect(
      earliestItunesYear(bohemian, {
        artist: 'Queen',
        title: 'Bohemian Rhapsody',
      }),
    ).toBe(1975)
  })

  it('matches on the primary artist when Spotify joins several', () => {
    const r = [
      {
        kind: 'song',
        trackName: 'Get Lucky',
        artistName: 'Daft Punk, Pharrell Williams & Nile Rodgers',
        releaseDate: '2013-04-19T12:00:00Z',
      },
    ]
    expect(
      earliestItunesYear(r, {
        artist: 'Daft Punk, Pharrell Williams & Nile Rodgers',
        title: 'Get Lucky',
      }),
    ).toBe(2013)
  })

  it('returns null when nothing matches', () => {
    expect(earliestItunesYear([], { artist: 'X', title: 'Y' })).toBeNull()
    expect(
      earliestItunesYear(bohemian, {
        artist: 'Queen',
        title: 'Somebody to Love',
      }),
    ).toBeNull()
  })

  it('ignores junk years', () => {
    const r = [
      {
        kind: 'song',
        trackName: 'Song',
        artistName: 'A',
        releaseDate: '1700-01-01',
      },
      {
        kind: 'song',
        trackName: 'Song',
        artistName: 'A',
        releaseDate: '1999-01-01',
      },
    ]
    expect(earliestItunesYear(r, { artist: 'A', title: 'Song' })).toBe(1999)
  })
})

describe('reconcileYear', () => {
  it('takes the earliest credible (original) year', () => {
    expect(reconcileYear(2018, 1975)).toBe(1975)
    expect(reconcileYear(1975, 1975)).toBe(1975)
    expect(reconcileYear(2013, 2013)).toBe(2013)
  })
  it('falls back when a source is missing', () => {
    expect(reconcileYear(null, 1975)).toBe(1975)
    expect(reconcileYear(2018, null)).toBe(2018)
    expect(reconcileYear(null, null)).toBeNull()
  })
})
