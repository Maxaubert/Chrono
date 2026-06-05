import type { MysteryProps } from '../play/adapter'
import { clueBySlug } from './deck'
import './history-play.css'

/** History's mystery slot: a silent text-clue card (no audio). The card's
 *  identity is the clue, so only `drawn` is read from MysteryProps. */
export default function HistoryMystery({ drawn }: MysteryProps) {
  const clue = drawn ? clueBySlug.get(drawn.card.id) : undefined
  return (
    <div className="mystery-wrap">
      <div className="h-card hist-myst">
        <div className="hist-myst-kicker">When did it happen?</div>
        <p className="hist-myst-clue">{clue}</p>
      </div>
      <div className="myst-hint">tap a slot below to place it</div>
    </div>
  )
}
