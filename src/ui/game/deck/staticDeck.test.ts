import { describe, expect, it } from 'vitest'
import type { DrawnCard } from '@/core'
import { makeStaticDeck, shuffle } from './staticDeck'

type Raw = { id: string; year: number }
const RAW: Raw[] = [
  { id: 'a', year: 1 },
  { id: 'b', year: 2 },
  { id: 'c', year: 3 },
]
const toDrawn = (c: Raw): DrawnCard => ({
  card: { id: c.id, year: c.year },
  reveal: { title: c.id, subtitle: 'x', year: c.year },
})

describe('makeStaticDeck', () => {
  it('draws every card once, then null', async () => {
    const handle = makeStaticDeck(RAW, toDrawn, () => 0)
    const seen: string[] = []
    let d = await handle.next()
    while (d) {
      seen.push(d.card.id)
      d = await handle.next()
    }
    expect(seen.sort()).toEqual(['a', 'b', 'c'])
    expect(await handle.next()).toBeNull()
  })

  it('maps raw cards through toDrawn', async () => {
    const first = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    expect(typeof first!.card.id).toBe('string')
    expect(typeof first!.card.year).toBe('number')
    expect(first!.reveal.year).toBe(first!.card.year)
  })

  it('shuffles deterministically with the injected rng', async () => {
    const a = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    const b = await makeStaticDeck(RAW, toDrawn, () => 0).next()
    expect(a!.card.id).toBe(b!.card.id)
  })
})

describe('shuffle', () => {
  it('returns a new array holding the same elements', () => {
    const out = shuffle(RAW, () => 0.5)
    expect(out).not.toBe(RAW)
    expect(out.map((c) => c.id).sort()).toEqual(['a', 'b', 'c'])
  })
})
