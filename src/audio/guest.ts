import type { AudioProvider } from './types'

/**
 * Guest-mode "playback": there is none in-app. The song plays in each player's
 * own Spotify app when they scan the mystery card's QR code, so every method is a
 * no-op. Using a real provider (rather than branching in the game loop) keeps the
 * existing `provider.play(...)` call sites unchanged. The track-ref param is
 * omitted (an implementer may take fewer args than the interface).
 */
export class GuestProvider implements AudioProvider {
  readonly id = 'guest'
  async play(): Promise<void> {}
  async pause(): Promise<void> {}
  async resume(): Promise<void> {}
  async stop(): Promise<void> {}
}
