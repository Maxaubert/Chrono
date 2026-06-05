import { expect, test } from 'vitest'
import { buildSpectrum } from './audioAnalysis'

const analysis = {
  track: { duration: 4 },
  segments: [
    {
      start: 0,
      duration: 2,
      loudness_max: -30, // quiet
      pitches: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      start: 2,
      duration: 2,
      loudness_max: 0, // loud
      pitches: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
  ],
}

test('returns one level per band, each within 0..1', () => {
  const s = buildSpectrum(analysis)
  const levels = s.levelsAt(0, 16)
  expect(levels).toHaveLength(16)
  for (const l of levels) {
    expect(l).toBeGreaterThanOrEqual(0)
    expect(l).toBeLessThanOrEqual(1)
  }
})

test('a louder segment yields higher overall levels than a quiet one', () => {
  const s = buildSpectrum(analysis)
  const quiet = s.levelsAt(0.5, 12) // first segment (loud_max -30)
  const loud = s.levelsAt(3, 12) // second segment (loud_max 0)
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
  expect(sum(loud)).toBeGreaterThan(sum(quiet))
})

test('picks the segment covering the position', () => {
  const s = buildSpectrum(analysis)
  // first segment only has energy in pitch 0, so bands past the first are low
  const early = s.levelsAt(0.5, 12)
  expect(early[11]).toBeLessThan(early[0])
  expect(s.duration).toBe(4)
})
