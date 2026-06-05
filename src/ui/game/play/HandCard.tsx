import { cardGradient } from './cardArt'
import './hand.css'

export default function HandCard({
  id,
  year,
  title,
  image,
}: {
  id: string
  year: number
  title?: string
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
      <div className="brand">Hitster</div>
    </div>
  )
}
