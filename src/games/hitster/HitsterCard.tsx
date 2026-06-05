import { SAMPLE_DECK, type Song } from './deck'

/**
 * Hitster's decorative menu card: a record-year card with album art. Visuals
 * are styled by the Hitster skin (.skin-hitster) in skin.css.
 */

function AlbumArt({ song }: { song: Song }) {
  // Real album cover when available; the gradient + disc + bars are the fallback.
  if (song.img) {
    return (
      <div
        className="art art-cover"
        style={{ backgroundImage: `url(${song.img})` }}
      >
        <span className="art-sheen" />
      </div>
    )
  }
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
    <div className="h-card">
      <span className="idx tl">
        {song.year}
        <i>&#9834;</i>
      </span>

      <AlbumArt song={song} />

      <div className="info">
        <b className="title">{song.title}</b>
        <span className="artist">{song.artist}</span>
      </div>

      <div className="brand">HITSTER</div>
    </div>
  )
}
