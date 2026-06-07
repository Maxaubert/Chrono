import type { ComponentType } from 'react'
import type { MysteryProps } from '../play/adapter'
import './static-play.css'

/** Build a silent, image-less mystery card: a kicker + the card's text clue.
 *  The clue is looked up by card id. Used by typographic decks (Star Wars). */
export function makeTypographicMystery(
  clueById: Map<string, string | undefined>,
  kicker: string,
): ComponentType<MysteryProps> {
  return function TypographicMystery({ drawn }: MysteryProps) {
    const clue = drawn ? clueById.get(drawn.card.id) : undefined
    return (
      <div className="mystery-wrap">
        <div className="h-card sd-myst">
          <div className="sd-myst-kicker">{kicker}</div>
          <p className="sd-myst-clue">{clue}</p>
        </div>
        <div className="myst-hint">tap a slot below to place it</div>
      </div>
    )
  }
}
