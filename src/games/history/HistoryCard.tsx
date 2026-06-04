import { SAMPLE_EVENTS } from './events'

/**
 * History's decorative menu card: a calmer "museum plaque" card with the year
 * and a historic event. Visuals are styled by the History skin (.skin-history).
 */

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
