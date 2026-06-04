/**
 * Hitster's decorative menu card: a record-year card with album art. Visuals
 * are styled by the Hitster skin (.skin-hitster) in skin.css. The album-art
 * gradients are placeholders for the menu fan; real in-game cards render the
 * actual Spotify album image.
 */

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

function AlbumArt({ song }: { song: Song }) {
  const bg = `linear-gradient(150deg, ${song.g1}, ${song.g2})`
  return (
    <div className="art" style={{ background: bg }}>
      <span className="art-disc" />
      <span className="art-sheen" />
      <span className="art-bars">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </span>
    </div>
  )
}

/** The i-th decorative card for the menu fan. */
export function FanCard({ index }: { index: number }) {
  const song = SAMPLE_DECK[index % SAMPLE_DECK.length]
  return (
    <div className="card front">
      <span className="foil" />
      <span className="idx tl">
        {song.year}
        <i>&#9834;</i>
      </span>

      <AlbumArt song={song} />

      <div className="info">
        <b className="title">{song.title}</b>
        <span className="artist">{song.artist}</span>
      </div>

      <div className="brand">Hitster</div>
      <span className="idx br">
        {song.year}
        <i>&#9834;</i>
      </span>
    </div>
  )
}
