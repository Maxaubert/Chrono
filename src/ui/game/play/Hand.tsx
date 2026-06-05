import { type CSSProperties } from 'react'
import type { Card } from '@/core'
import { handLayout } from './handGeometry'
import HandCard from './HandCard'
import './hand.css'

export default function Hand({
  timeline,
  onPlace,
  titleOf,
  piled = false,
}: {
  timeline: Card[]
  onPlace: (slotIndex: number) => void
  titleOf?: (id: string) => string | undefined
  piled?: boolean
}) {
  const { scale, cards } = handLayout(timeline.length)
  return (
    <div
      className={`hand ${piled ? 'piled' : ''}`}
      style={{ '--hand-scale': scale } as CSSProperties}
    >
      {timeline.map((card, i) => {
        const t = cards[i]
        return (
          <div
            className="hand-slot"
            key={card.id}
            style={
              {
                '--tx': `${t.tx}px`,
                '--ty': `${t.ty}px`,
                '--rot': `${t.rot}deg`,
                '--i': i,
                '--ci': timeline.length - 1 - i,
              } as CSSProperties
            }
          >
            <button
              className="hand-gap"
              data-testid={`gap-${i}`}
              aria-label={`Place before ${card.year}`}
              onClick={() => onPlace(i)}
            />
            <HandCard
              id={card.id}
              year={card.year}
              title={titleOf?.(card.id)}
            />
          </div>
        )
      })}
      <button
        className="hand-gap hand-gap-end"
        data-testid={`gap-${timeline.length}`}
        aria-label="Place at the end"
        onClick={() => onPlace(timeline.length)}
      />
    </div>
  )
}
