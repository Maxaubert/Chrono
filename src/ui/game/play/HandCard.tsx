import { cardGradient } from './cardArt'
import './hand.css'

export default function HandCard({
  id,
  year,
  title,
  artist,
  image,
}: {
  id: string
  year: number
  title?: string
  artist?: string
  image?: string | null
}) {
  const art = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: cardGradient(id) }
  return (
    <div className="h-card front handcard">
      <span className="hc-year">{year}</span>
      <div className="hc-art" style={art} />
      {title && <div className="hc-title">{title}</div>}
      {artist && <div className="hc-artist">{artist}</div>}
      <div className="brand">HITSTER</div>
    </div>
  )
}
