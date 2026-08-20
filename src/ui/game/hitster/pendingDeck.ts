// src/ui/game/hitster/pendingDeck.ts
import type { SpotifyTrack } from '@/spotify'

/**
 * The tracks the setup wizard chose, stashed for the adapter to deal from.
 * Module-scoped (one Hitster setup runs at a time) so the wizard can be a
 * module-level component with a stable identity -- which is what keeps React
 * from remounting it, and wiping its state, when the session updates
 * mid-setup -- while GameSetupResult stays game-neutral (names + target only).
 */
const state = {
  tracks: [] as SpotifyTrack[],
  imageById: new Map<string, string | null>(),
}

export function stashPendingDeck(tracks: SpotifyTrack[]): void {
  state.tracks = tracks
  state.imageById = new Map(tracks.map((t) => [t.id, t.image]))
}

export function pendingTracks(): SpotifyTrack[] {
  return state.tracks
}

/** Album cover for a stashed track (used by the reveal), or undefined. */
export function pendingImage(id: string): string | undefined {
  return state.imageById.get(id) ?? undefined
}
