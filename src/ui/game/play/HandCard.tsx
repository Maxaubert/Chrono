import { cardGradient } from './cardArt'
import './hand.css'

export default function HandCard({
  id,
  year,
  title,
}: {
  id: string
  year: number
  title?: string
}) {
  return (
    <div className="h-card front handcard">
      <span className="hc-year">{year}</span>
      <div className="hc-art" style={{ background: cardGradient(id) }} />
      {title && <div className="hc-title">{title}</div>}
      <div className="brand">Hitster</div>
    </div>
  )
}
