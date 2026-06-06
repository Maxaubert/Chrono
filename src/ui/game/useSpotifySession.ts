import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ItunesPreviewProvider,
  MockProvider,
  type AudioProvider,
} from '@/audio'
import {
  buildAuthorizeUrl,
  clearTokens,
  deriveChallenge,
  exchangeCodeForTokens,
  fetchMyPlaylists,
  fetchPlaylistTracksViaServer,
  fetchTrackYear,
  generateVerifier,
  getSpotifyConfig,
  isExpired,
  loadTokens,
  type MyPlaylist,
  saveTokens,
  saveVerifier,
  SpotifyProvider,
  peekVerifier,
  clearVerifier,
  type SpotifyTrack,
} from '@/spotify'

/** True only when a stored token exists and has not expired. */
function hasValidToken(): boolean {
  const tokens = loadTokens()
  return !!tokens && !isExpired(tokens)
}

// Module-scoped so the OAuth code/verifier are exchanged exactly once per page
// load, even if the hook remounts on the /callback page (a per-instance ref does
// not survive a remount). Reset on a fresh login() or an exchange failure.
let oauthExchangeStarted = false

// A tiny fixed deck for ?mock=1 (no real Spotify). Years strictly increase in
// draw order so placing at the rightmost gap is always correct (E2E relies on this).
const MOCK_TRACKS: SpotifyTrack[] = Array.from({ length: 8 }, (_, i) => ({
  id: `mock-${i}`,
  uri: `spotify:track:mock-${i}`,
  title: `Mock Song ${i}`,
  artist: 'Mock Artist',
  year: 1950 + i,
  image: null,
}))
const MOCK_YEAR: Record<string, number> = Object.fromEntries(
  MOCK_TRACKS.map((t) => [t.id, t.year as number]),
)

export interface SpotifySession {
  mock: boolean
  /** Guest mode: no login, playback handed to players' own Spotify via QR. */
  guest: boolean
  loggedIn: boolean
  connected: boolean
  error: string | null
  provider: AudioProvider
  login: () => Promise<void>
  logout: () => void
  connect: () => Promise<void>
  importPlaylistId: (id: string) => Promise<SpotifyTrack[]>
  loadMyPlaylists: () => Promise<MyPlaylist[]>
  fetchYear: (trackId: string) => Promise<number | null>
}

export function useSpotifySession(guestArg = false): SpotifySession {
  const params = new URLSearchParams(window.location.search)
  const mock = params.get('mock') === '1'
  // Guest mode is chosen in the UI; ?guest=1 forces it (used by the E2E flow).
  const guest = guestArg || params.get('guest') === '1'
  const provider = useMemo<AudioProvider>(
    () =>
      guest
        ? new ItunesPreviewProvider()
        : mock
          ? new MockProvider()
          : new SpotifyProvider({
              getAccessToken: () => loadTokens()?.accessToken ?? null,
            }),
    [mock, guest],
  )
  const [loggedIn, setLoggedIn] = useState(mock || hasValidToken())
  const [connected, setConnected] = useState(mock)
  const [error, setError] = useState<string | null>(null)

  // Handle the OAuth callback once. The authorization code and the PKCE verifier
  // are both single-use, so a double-processed callback (a remount, a StrictMode
  // double-invoke, a stray re-render) must not exchange twice -- otherwise the
  // first run consumes them, the second fails, and login silently does nothing
  // (the "log in twice" bug). Guard with a ref, peek the verifier without
  // consuming it, and only clear it once the token is saved.
  useEffect(() => {
    if (mock || guest || window.location.pathname !== '/callback') return
    if (oauthExchangeStarted) return
    const code = new URLSearchParams(window.location.search).get('code')
    const verifier = peekVerifier()
    if (!code || !verifier) return
    oauthExchangeStarted = true
    const { clientId, redirectUri } = getSpotifyConfig()
    exchangeCodeForTokens({ code, verifier, clientId, redirectUri })
      .then((tokens) => {
        clearVerifier()
        saveTokens(tokens)
        window.history.replaceState({}, '', '/')
        setLoggedIn(true)
      })
      .catch((e) => {
        // Keep the verifier so an honest retry is possible; surface the error.
        oauthExchangeStarted = false
        setError(String(e))
      })
  }, [mock, guest])

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

  const autoConnectStarted = useRef(false)

  function logout() {
    clearTokens()
    setConnected(false)
    setLoggedIn(false)
    setError(null)
    autoConnectStarted.current = false
  }

  async function connect() {
    if (mock) return setConnected(true)
    // Retry transient connect failures; a stale/expired token surfaces as an
    // auth error, so clear it and send the user back to a fresh login. Permanent
    // failures (not Premium, no DRM support, etc.) are surfaced immediately
    // rather than retried, so the host is not left staring at a greyed button.
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await (provider as SpotifyProvider).connect()
        setConnected(true)
        setError(null)
        return
      } catch (e) {
        const msg = String(e)
        if (/auth/i.test(msg)) {
          setError(msg)
          logout()
          return
        }
        // Not transient -> stop retrying and tell the host why.
        if (
          /premium|initiali|playback|never became ready|failed to connect/i.test(
            msg,
          )
        ) {
          setError(msg)
          return
        }
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        } else {
          setError(msg)
        }
      }
    }
  }

  // Connect the playback device automatically once logged in (no button needed).
  useEffect(() => {
    if (mock || guest || !loggedIn || connected || autoConnectStarted.current)
      return
    autoConnectStarted.current = true
    void connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock, guest, loggedIn, connected])

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
    guest,
    loggedIn,
    connected,
    error,
    provider,
    login,
    logout,
    connect,
    importPlaylistId,
    loadMyPlaylists,
    fetchYear,
  }
}
