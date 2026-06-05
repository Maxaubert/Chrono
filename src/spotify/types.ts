// src/spotify/types.ts

/** OAuth tokens. `expiresAt` is an epoch-ms timestamp. */
export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/** A track imported from a playlist. `year` is null when unparseable;
 *  `image` is the album cover URL (null when unavailable). */
export interface SpotifyTrack {
  id: string
  uri: string
  title: string
  artist: string
  year: number | null
  image: string | null
}

export interface PlaylistImportResult {
  id: string
  tracks: SpotifyTrack[]
}
