/**
 * Decorative Chrono card used by the front-page fan. Visuals live in menu.css.
 * The album-art gradients here are placeholders for the menu's flavor; real
 * in-game cards render the actual Spotify album image.
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

export function CardFront({
  song,
  state,
}: {
  song: Song
  state?: 'ok' | 'no'
}) {
  return (
    <div className={`card front ${state ?? ''}`}>
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

      <div className="brand">CHRONO</div>
      <span className="idx br">
        {song.year}
        <i>&#9834;</i>
      </span>

      {state === 'ok' && <span className="badge ok">&#10003; KEPT</span>}
      {state === 'no' && <span className="badge no">&#10005; LOST</span>}
    </div>
  )
}

export function CardBack() {
  return (
    <div className="card back">
      <span className="foil" />
      <div className="back-brand">CHRONO</div>
      <div className="vinyl">
        <span className="vinyl-label" />
      </div>
      <div className="eq">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <i key={i} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="prompt">GUESS THE YEAR</div>
      <span className="qmark">?</span>
    </div>
  )
}
