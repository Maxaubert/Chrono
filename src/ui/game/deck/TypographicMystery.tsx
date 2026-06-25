import type { ComponentType } from 'react'
import type { MysteryProps } from '../play/adapter'
import FramedMystery from '../play/FramedMystery'

/** Build a silent mystery card in the "framed by rules" style: the event card
 *  (art + title, no year) beside the text clue. The clue and the art are looked
 *  up by card id. Used by typographic decks (Star Wars). */
export function makeTypographicMystery(
  clueById: Map<string, string | undefined>,
  kicker: string,
  imageOf?: (id: string) => string | undefined,
): ComponentType<MysteryProps> {
  return function TypographicMystery({ drawn }: MysteryProps) {
    const id = drawn?.card.id
    return (
      <FramedMystery
        kicker={kicker}
        clue={id ? clueById.get(id) : undefined}
        image={id ? imageOf?.(id) : undefined}
        title={drawn?.reveal.title}
        era={drawn?.reveal.subtitle}
      />
    )
  }
}
