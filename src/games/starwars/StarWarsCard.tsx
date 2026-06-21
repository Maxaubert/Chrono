import './skin.css'

/** Star Wars decorative menu card: a piece of deck art under an imperial-red
 *  duotone, with the BBY/ABY year and the event title. Art lives at
 *  /starwars/cards/<slug>.jpg; titles cycle through a few iconic events. */
const SAMPLE = [
  { label: '0 ABY', title: 'Battle of Yavin', slug: 'battle-of-yavin' },
  { label: '19 BBY', title: 'Order 66', slug: 'order-66' },
  { label: '4 ABY', title: 'Battle of Endor', slug: 'battle-of-endor' },
  { label: '32 BBY', title: 'Invasion of Naboo', slug: 'invasion-of-naboo' },
]

export function FanCard({ index }: { index: number }) {
  const ev = SAMPLE[index % SAMPLE.length]
  return (
    <div className="h-card sw-card">
      <div className="sw-art" aria-hidden="true">
        <img src={`/starwars/cards/${ev.slug}.jpg`} alt="" loading="lazy" />
        <span className="sw-duo" />
        <span className="sw-scrim" />
      </div>
      <span className="sw-year">{ev.label}</span>
      <b className="sw-title">{ev.title}</b>
      <span className="sw-rule" aria-hidden="true" />
    </div>
  )
}
