// src/spotify/config.ts

export interface SpotifyConfig {
  clientId: string
  redirectUri: string
}

const DEFAULT_REDIRECT = 'http://127.0.0.1:5173/callback'

export function getSpotifyConfig(): SpotifyConfig {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Missing VITE_SPOTIFY_CLIENT_ID. Copy .env.example to .env and add your ' +
        'Spotify app client id.',
    )
  }
  return {
    clientId,
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT,
  }
}
