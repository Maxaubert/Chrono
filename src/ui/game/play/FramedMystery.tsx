import './framed-mystery.css'

/**
 * The in-game mystery/clue, "framed by rules" style. Desktop shows the event
 * card (art + title, no year) beside the quote; mobile (under
 * `.mobile-game-screen`) hides the card via CSS and shows just the quote. Both
 * are bracketed by accent rules. Shared by every deck game; colours follow the
 * active skin's theme vars.
 */
export default function FramedMystery({
  kicker,
  clue,
  image,
  title,
  era,
}: {
  kicker: string
  clue?: string
  image?: string | null
  title?: string
  era?: string
}) {
  return (
    <div className="mystery-wrap">
      <div className="fmyst">
        {image && (
          <div className="fmyst-card" aria-hidden="true">
            <img src={image} alt="" />
            <div className="fmyst-cap">
              {title && <span className="fmyst-title">{title}</span>}
              {era && <span className="fmyst-era">{era}</span>}
            </div>
          </div>
        )}
        <div className="fmyst-q">
          <span className="fmyst-kicker">{kicker}</span>
          <p className="fmyst-clue">{clue}</p>
        </div>
      </div>
      <div className="myst-hint">tap a slot below to place it</div>
    </div>
  )
}
