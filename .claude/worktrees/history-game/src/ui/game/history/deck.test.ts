import { describe, expect, it } from 'vitest'
import { clueBySlug, imageBySlug, makeHistoryDeck } from './deck'

describe('makeHistoryDeck', () => {
  it('draws cards as DrawnCards with id, year and reveal', async () => {
    const first = await makeHistoryDeck(() => 0).next()
    expect(first).not.toBeNull()
    expect(typeof first!.card.id).toBe('string')
    expect(typeof first!.card.year).toBe('number')
    expect(first!.reveal.title.length).toBeGreaterThan(0)
    expect(first!.reveal.year).toBe(first!.card.year)
  })

  it('shuffles deterministically with the injected rng', async () => {
    const a = await makeHistoryDeck(() => 0).next()
    const b = await makeHistoryDeck(() => 0).next()
    expect(a!.card.id).toBe(b!.card.id)
  })

  it('exposes a clue and image for each card', async () => {
    const drawn = await makeHistoryDeck(() => 0.5).next()
    expect(clueBySlug.get(drawn!.card.id)).toBeTruthy()
    expect(imageBySlug.get(drawn!.card.id)).toMatch(/^\/history\/.+\.jpg$/)
  })

  it('exhausts after the whole deck', async () => {
    const handle = makeHistoryDeck(() => 0)
    let n = 0
    while (await handle.next()) n++
    expect(n).toBe(100)
  })
})
