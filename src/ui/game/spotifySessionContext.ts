// src/ui/game/spotifySessionContext.ts
import { createContext, useContext } from 'react'
import type { SpotifySession } from './useSpotifySession'

/**
 * The live Spotify session, provided once by the app shell. Setup components
 * read it from here instead of closing over a snapshot, so a session update
 * (auto-connect finishing, a delayed SDK error) re-renders them in place
 * rather than forcing the play adapter -- and with it the Setup component's
 * identity -- to be rebuilt, which would remount the wizard and wipe its state.
 */
const SpotifySessionContext = createContext<SpotifySession | null>(null)

export const SpotifySessionProvider = SpotifySessionContext.Provider

export function useSpotifySessionContext(): SpotifySession {
  const session = useContext(SpotifySessionContext)
  if (!session) {
    throw new Error(
      'useSpotifySessionContext requires a SpotifySessionProvider',
    )
  }
  return session
}
