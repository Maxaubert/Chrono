import type { MysteryProps } from '../play/adapter'
import FramedMystery from '../play/FramedMystery'
import { clueBySlug, imageBySlug } from './deck'

/** History's mystery slot: the "framed by rules" event card (painting + title,
 *  no year) beside the silent text clue. The clue is the card's identity, so
 *  only `drawn` is read. */
export default function HistoryMystery({ drawn }: MysteryProps) {
  const id = drawn?.card.id
  return (
    <FramedMystery
      kicker="When did it happen?"
      clue={id ? clueBySlug.get(id) : undefined}
      image={id ? imageBySlug.get(id) : undefined}
      title={drawn?.reveal.title}
      era={drawn?.reveal.subtitle}
    />
  )
}
