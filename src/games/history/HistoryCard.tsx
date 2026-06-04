/**
 * History's decorative menu card: a calmer "museum plaque" card with the year
 * and a historic event. Visuals are styled by the History skin (.skin-history)
 * in skin.css. Sample events are placeholders for the menu fan.
 */

export type HistoryEvent = {
  year: string
  title: string
  place: string
}

export const SAMPLE_EVENTS: HistoryEvent[] = [
  { year: '1215', title: 'Magna Carta', place: 'England' },
  { year: '1492', title: 'New World', place: 'Atlantic' },
  { year: '1789', title: 'Revolution', place: 'France' },
  { year: '1969', title: 'Moon Landing', place: 'Apollo 11' },
]

/** The i-th decorative card for the menu fan. */
export function FanCard({ index }: { index: number }) {
  const ev = SAMPLE_EVENTS[index % SAMPLE_EVENTS.length]
  return (
    <div className="card front hist">
      <span className="idx tl">{ev.year}</span>

      <div className="plaque">
        <span className="ev-era">EST. {ev.year}</span>
        <span className="ev-title">{ev.title}</span>
        <span className="ev-sub">{ev.place}</span>
      </div>

      <div className="brand">History</div>
      <span className="idx br">{ev.year}</span>
    </div>
  )
}
