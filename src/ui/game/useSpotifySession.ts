import { useEffect, useMemo, useState } from 'react'
import { MockProvider, type AudioProvider } from '@/audio'
import {
  buildAuthorizeUrl,
  deriveChallenge,
  exchangeCodeForTokens,
  fetchMyPlaylists,
  fetchPlaylistTracksViaServer,
  fetchTrackYear,
  generateVerifier,
  getSpotifyConfig,
  loadTokens,
  type MyPlaylist,
  saveTokens,
  saveVerifier,
  SpotifyProvider,
  takeVerifier,
  type SpotifyTrack,
} from '@/spotify'

// A tiny fixed deck for ?mock=1 (no real Spotify). Years strictly increase in
// draw order so placing at the rightmost gap is always correct (E2E relies on this).
const MOCK_TRACKS: SpotifyTrack[] = Array.from({ length: 8 }, (_, i) => ({
  id: `mock-${i}`,
  uri: `spotify:track:mock-${i}`,
  title: `Mock Song ${i}`,
  artist: 'Mock Artist',
  year: 1950 + i,
}))
const MOCK_YEAR: Record<string, number> = Object.fromEntries(
  MOCK_TRACKS.map((t) => [t.id, t.year as number]),
)

export interface SpotifySession {
  mock: boolean
  loggedIn: boolean
  connected: boolean
  error: string | null
  provider: AudioProvider
  login: () => Promise<void>
  connect: () => Promise<void>
  importPlaylistId: (id: string) => Promise<SpotifyTrack[]>
  loadMyPlaylists: () => Promise<MyPlaylist[]>
  fetchYear: (trackId: string) => Promise<number | null>
}

export function useSpotifySession(): SpotifySession {
  const mock = new URLSearchParams(window.location.search).get('mock') === '1'
  const provider = useMemo<AudioProvider>(
    () =>
      mock
        ? new MockProvider()
        : new SpotifyProvider({
            getAccessToken: () => loadTokens()?.accessToken ?? null,
          }),
    [mock],
  )
  const [loggedIn, setLoggedIn] = useState(mock || !!loadTokens())
  const [connected, setConnected] = useState(mock)
  const [error, setError] = useState<string | null>(null)

  // Handle the OAuth callback once on mount.
  useEffect(() => {
    if (mock || window.location.pathname !== '/callback') return
    const code = new URLSearchParams(window.location.search).get('code')
    const verifier = takeVerifier()
    if (!code || !verifier) return
    const { clientId, redirectUri } = getSpotifyConfig()
    exchangeCodeForTokens({ code, verifier, clientId, redirectUri })
      .then((tokens) => {
        saveTokens(tokens)
        window.history.replaceState({}, '', '/')
        setLoggedIn(true)
      })
      .catch((e) => setError(String(e)))
  }, [mock])

  async function login() {
    try {
      const { clientId, redirectUri } = getSpotifyConfig()
      const verifier = generateVerifier()
      saveVerifier(verifier)
      const challenge = await deriveChallenge(verifier)
      window.location.href = buildAuthorizeUrl({
        clientId,
        redirectUri,
        challenge,
      })
    } catch (e) {
      setError(String(e))
    }
  }

  async function connect() {
    if (mock) return setConnected(true)
    try {
      await (provider as SpotifyProvider).connect()
      setConnected(true)
    } catch (e) {
      setError(String(e))
    }
  }

  async function importPlaylistId(id: string): Promise<SpotifyTrack[]> {
    if (mock) return MOCK_TRACKS
    const { tracks } = await fetchPlaylistTracksViaServer({ playlistId: id })
    return tracks
  }

  async function loadMyPlaylists(): Promise<MyPlaylist[]> {
    if (mock) return []
    const token = loadTokens()?.accessToken
    if (!token) return []
    return fetchMyPlaylists({ accessToken: token })
  }

  async function fetchYear(trackId: string): Promise<number | null> {
    if (mock) return MOCK_YEAR[trackId] ?? null
    return fetchTrackYear({ trackId })
  }

  return {
    mock,
    loggedIn,
    connected,
    error,
    provider,
    login,
    connect,
    importPlaylistId,
    loadMyPlaylists,
    fetchYear,
  }
}
