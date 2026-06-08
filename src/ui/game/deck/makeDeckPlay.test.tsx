import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { DrawnCard } from '@/core'
import { makeDeckPlay } from './makeDeckPlay'
import { makeTypographicMystery } from './TypographicMystery'

type Raw = { id: string; year: number }
const RAW: Raw[] = [{ id: 'a', year: 1 }]
const toDrawn = (c: Raw): DrawnCard => ({
  card: { id: c.id, year: c.year },
  reveal: { title: c.id, year: c.year },
})
const Mystery = makeTypographicMystery(new Map([['a', 'a clue']]), 'When?')

test('makeDeckPlay builds an initDeck that draws the static cards', async () => {
  const play = makeDeckPlay({
    cards: RAW,
    toDrawn,
    Mystery,
    Setup: () => null,
  })
  const handle = await play.initDeck({ names: ['x'], targetCards: 5 }, () => 0)
  const first = await handle.next()
  expect(first!.card.id).toBe('a')
  expect(play.revealImage).toBeUndefined()
})

test('makeTypographicMystery renders the clue for the drawn card', () => {
  render(
    <Mystery
      drawn={toDrawn(RAW[0])}
      isPlaying={false}
      onPause={() => {}}
      onResume={() => {}}
      onReplay={() => {}}
    />,
  )
  expect(screen.getByText('a clue')).toBeInTheDocument()
  expect(screen.getByText('When?')).toBeInTheDocument()
})
