/** Sample songs for the decorative menu fan (placeholders; real cards use
 *  Spotify data). Kept separate from the card component for fast-refresh. */

export type Song = {
  year: string
  title: string
  artist: string
  g1: string
  g2: string
  /** Real album cover (iTunes CDN) for the decorative fan; falls back to g1/g2. */
  img: string
}

const COVER = (path: string) =>
  `https://is1-ssl.mzstatic.com/image/thumb/${path}/300x300bb.jpg`

export const SAMPLE_DECK: Song[] = [
  {
    year: '1971',
    title: 'Imagine',
    artist: 'John Lennon',
    g1: '#6b3fd6',
    g2: '#b08bff',
    img: COVER(
      'Music126/v4/21/e3/b0/21e3b048-c917-92c4-bd7d-ace44797b388/13UABIM52808.rgb.jpg',
    ),
  },
  {
    year: '1984',
    title: 'When Doves Cry',
    artist: 'Prince',
    g1: '#c81e66',
    g2: '#ff5fa6',
    img: COVER(
      'Music125/v4/9d/14/10/9d141037-6ad8-4847-6622-bcff54e8584e/886448962830.jpg',
    ),
  },
  {
    year: '1995',
    title: 'Wonderwall',
    artist: 'Oasis',
    g1: '#0f7fa0',
    g2: '#3fd6ff',
    img: COVER(
      'Music113/v4/04/92/e0/0492e08b-cbcc-9969-9ad6-8f5a0888068c/5051961007107.jpg',
    ),
  },
  {
    year: '1973',
    title: 'Money',
    artist: 'Pink Floyd',
    g1: '#1b1b1b',
    g2: '#3a2a4a',
    img: COVER(
      'Music211/v4/49/86/18/49861852-877b-0992-fa27-58b25fa032b5/196589805232.jpg',
    ),
  },
]
