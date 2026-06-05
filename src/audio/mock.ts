import type { AudioProvider, AudioTrackRef } from './types'

/**
 * A no-op audio provider for tests and offline development. Records the calls it
 * receives so tests can assert on playback behaviour without real audio.
 */
export class MockProvider implements AudioProvider {
  readonly id = 'mock'
  readonly calls: Array<{
    method: 'play' | 'pause' | 'resume' | 'stop'
    track?: AudioTrackRef
  }> = []

  async play(track: AudioTrackRef): Promise<void> {
    this.calls.push({ method: 'play', track })
  }

  async pause(): Promise<void> {
    this.calls.push({ method: 'pause' })
  }

  async resume(): Promise<void> {
    this.calls.push({ method: 'resume' })
  }

  async stop(): Promise<void> {
    this.calls.push({ method: 'stop' })
  }
}
