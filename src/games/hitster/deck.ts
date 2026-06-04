/** Sample songs for the decorative menu fan (placeholders; real cards use
 *  Spotify data). Kept separate from the card component for fast-refresh. */

export type Song = {
  year: string
  title: string
  artist: string
  g1: string
  g2: string
}

export const SAMPLE_DECK: Song[] = [
  {
    year: '1971',
    title: 'Imagine',
    artist: 'John Lennon',
    g1: '#6b3fd6',
    g2: '#b08bff',
  },
  {
    year: '1984',
    title: 'When Doves Cry',
    artist: 'Prince',
    g1: '#c81e66',
    g2: '#ff5fa6',
  },
  {
    year: '1995',
    title: 'Wonderwall',
    artist: 'Oasis',
    g1: '#0f7fa0',
    g2: '#3fd6ff',
  },
  {
    year: '2009',
    title: 'Uprising',
    artist: 'Muse',
    g1: '#3a7d12',
    g2: '#8fe04a',
  },
]
