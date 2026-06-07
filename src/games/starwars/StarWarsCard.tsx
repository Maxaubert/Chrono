import './skin.css'

/** Star Wars decorative menu card: typographic, crawl-yellow on a starfield.
 *  No imagery (sidesteps the IP concern); titles cycle through a few events. */
const SAMPLE = [
  { label: '0 ABY', title: 'Battle of Yavin' },
  { label: '19 BBY', title: 'Order 66' },
  { label: '4 ABY', title: 'Battle of Endor' },
  { label: '32 BBY', title: 'Invasion of Naboo' },
]

export function FanCard({ index }: { index: number }) {
  const ev = SAMPLE[index % SAMPLE.length]
  return (
    <div className="h-card sw-card">
      <div className="sw-stars" aria-hidden="true" />
      <span className="sw-year">{ev.label}</span>
      <b className="sw-title">{ev.title}</b>
      <span className="sw-rule" aria-hidden="true" />
    </div>
  )
}
