// src/spotify/types.ts

/** OAuth tokens. `expiresAt` is an epoch-ms timestamp. */
export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/** A track imported from a playlist. `year` is null when unparseable. */
export interface SpotifyTrack {
  id: string
  uri: string
  title: string
  artist: string
  year: number | null
}

export interface PlaylistImportResult {
  id: string
  tracks: SpotifyTrack[]
}
