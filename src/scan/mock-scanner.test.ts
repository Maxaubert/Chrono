import { describe, expect, it, vi } from 'vitest'
import { MockScanner } from './mock-scanner'

describe('MockScanner', () => {
  it('delivers emitted text to the registered callback', async () => {
    const scanner = new MockScanner()
    const onDecode = vi.fn()
    await scanner.start({} as HTMLVideoElement, onDecode)
    scanner.emit('chrono:t:T1')
    expect(onDecode).toHaveBeenCalledWith('chrono:t:T1')
  })

  it('stops delivering after stop()', async () => {
    const scanner = new MockScanner()
    const onDecode = vi.fn()
    await scanner.start({} as HTMLVideoElement, onDecode)
    scanner.stop()
    scanner.emit('chrono:t:T1')
    expect(onDecode).not.toHaveBeenCalled()
  })
})
