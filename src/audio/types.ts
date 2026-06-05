/**
 * Audio playback is abstracted behind this interface so the game logic never
 * depends on a specific source. Phase 1 ships a Spotify Web Playback SDK
 * provider; later phases add a login-free 30s-clip provider and a QR/hosted
 * player. Tests use the MockProvider.
 */

/** A provider-specific reference to a playable track (e.g. a Spotify track URI).
 * `artist`/`title` are optional search hints used by sources that look a track up
 * by metadata (the iTunes preview provider); URI-based providers ignore them. */
export interface AudioTrackRef {
  uri: string
  artist?: string
  title?: string
}

export interface AudioProvider {
  readonly id: string
  /** Start (or restart) playback of the given track. Identity stays hidden. */
  play(track: AudioTrackRef): Promise<void>
  pause(): Promise<void>
  /** Resume the current track from where it was paused. */
  resume(): Promise<void>
  stop(): Promise<void>
}
