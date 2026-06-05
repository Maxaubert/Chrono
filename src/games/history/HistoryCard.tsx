import { SAMPLE_EVENTS } from './events'

/**
 * History's decorative menu card: a real public-domain image with a warm gold
 * duotone treatment, the year, and the event title. Styled by the History skin
 * (.skin-history) in skin.css. The image is a placeholder pulled from Wikimedia;
 * the curated deck art is sourced when the History game is built.
 */
export function FanCard({ index }: { index: number }) {
  const ev = SAMPLE_EVENTS[index % SAMPLE_EVENTS.length]
  return (
    <div className="h-card front hist">
      <div className="hist-art">
        <img src={ev.img} alt={ev.title} loading="lazy" />
        <span className="hist-duo" />
        <span className="hist-scrim" />
      </div>
      <span className="hist-year">{ev.year}</span>
      <div className="hist-cap">
        <span className="hist-era">{ev.era}</span>
        <b className="hist-title">{ev.title}</b>
      </div>
    </div>
  )
}
