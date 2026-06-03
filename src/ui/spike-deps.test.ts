import { describe, expect, it } from 'vitest'
import { MockProvider } from '@/audio'
import { MockScanner } from '@/scan'
import { createSpikeDeps } from './spike-deps'

describe('createSpikeDeps', () => {
  it('returns mock provider + scanner when mock=1', () => {
    const deps = createSpikeDeps('?mock=1')
    expect(deps.mock).toBe(true)
    expect(deps.provider).toBeInstanceOf(MockProvider)
    expect(deps.scanner).toBeInstanceOf(MockScanner)
  })

  it('returns the real provider otherwise', () => {
    const deps = createSpikeDeps('')
    expect(deps.mock).toBe(false)
    expect(deps.provider.id).toBe('spotify')
  })
})
