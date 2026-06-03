// src/ui/SpikeHarness.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildAuthorizeUrl,
  deriveChallenge,
  exchangeCodeForTokens,
  fetchPlaylistTracksViaEmbed,
  generateVerifier,
  getSpotifyConfig,
  loadTokens,
  parsePlaylistId,
  saveTokens,
  saveVerifier,
  SpotifyProvider,
  takeVerifier,
  type SpotifyTrack,
} from '@/spotify'
import {
  decodeTrackToken,
  encodeTrackToken,
  renderQrDataUrl,
  trackIdToUri,
} from '@/scan'
import { createSpikeDeps } from './spike-deps'

type Card = SpotifyTrack & { qr: string }

export default function SpikeHarness() {
  const deps = useMemo(() => createSpikeDeps(window.location.search), [])
  const [loggedIn, setLoggedIn] = useState(deps.mock || !!loadTokens())
  const [connected, setConnected] = useState(deps.mock)
  const [playlist, setPlaylist] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle the OAuth callback once on mount.
  useEffect(() => {
    if (deps.mock) return
    if (window.location.pathname !== '/callback') return
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
  }, [deps.mock])

  // In mock mode, pre-seed two cards so the flow needs no Spotify.
  useEffect(() => {
    if (!deps.mock) return
    const seed: SpotifyTrack[] = [
      {
        id: 'MOCK1',
        uri: 'spotify:track:MOCK1',
        title: 'Mock Song',
        artist: 'Mock Artist',
        year: 1999,
      },
      {
        id: 'MOCK2',
        uri: 'spotify:track:MOCK2',
        title: 'Second Mock',
        artist: 'Mock Artist',
        year: 2008,
      },
    ]
    Promise.all(
      seed.map(async (t) => ({
        ...t,
        qr: await renderQrDataUrl(encodeTrackToken(t.id)),
      })),
    ).then(setCards)
  }, [deps.mock])

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
    try {
      await (deps.provider as SpotifyProvider).connect()
      setConnected(true)
    } catch (e) {
      setError(String(e))
    }
  }

  async function importPlaylist() {
    setError(null)
    const id = parsePlaylistId(playlist)
    if (!id) return setError('Could not parse a playlist id from that input.')
    try {
      // Read tracks from the public embed page (the Web API playlist endpoint
      // is blocked for development-mode apps). Public playlists only.
      const tracks = await fetchPlaylistTracksViaEmbed({ playlistId: id })
      const withQr = await Promise.all(
        tracks.map(async (t) => ({
          ...t,
          qr: await renderQrDataUrl(encodeTrackToken(t.id)),
        })),
      )
      setCards(withQr)
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleDecode(text: string) {
    const id = decodeTrackToken(text)
    if (!id) return
    const card = cards.find((c) => c.id === id) ?? null
    setRevealed(false)
    setNowPlaying(card)
    try {
      await deps.provider.play(trackIdToUri(id))
    } catch (e) {
      setError(String(e))
    }
  }

  async function startScanning() {
    setScanning(true)
    if (videoRef.current)
      await deps.scanner.start(videoRef.current, handleDecode)
  }

  function stopScanning() {
    deps.scanner.stop()
    setScanning(false)
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Chrono spike: playback + scan</h1>
      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="mt-6 flex flex-wrap gap-3">
        {!loggedIn && (
          <button
            className="rounded bg-green-600 px-4 py-2 text-white"
            onClick={login}
          >
            Log in with Spotify
          </button>
        )}
        {loggedIn && !connected && (
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={connect}
          >
            Connect player
          </button>
        )}
        {connected && (
          <span className="self-center text-sm text-green-700">
            Player ready
          </span>
        )}
      </section>

      {loggedIn && !deps.mock && (
        <section className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2"
            placeholder="Paste a Spotify playlist link"
            value={playlist}
            onChange={(e) => setPlaylist(e.target.value)}
          />
          <button
            className="rounded bg-neutral-800 px-4 py-2 text-white"
            onClick={importPlaylist}
          >
            Import
          </button>
        </section>
      )}

      {cards.length > 0 && (
        <section className="mt-6">
          <p className="mb-3 text-sm font-medium" data-testid="card-count">
            Imported {cards.length} cards
          </p>
          <div className="flex items-center gap-3">
            {!scanning ? (
              <button
                className="rounded bg-purple-600 px-4 py-2 text-white"
                onClick={startScanning}
              >
                Start scanning
              </button>
            ) : (
              <button
                className="rounded bg-neutral-500 px-4 py-2 text-white"
                onClick={stopScanning}
              >
                Stop scanning
              </button>
            )}
            {deps.mock && scanning && (
              <button
                data-testid="simulate-scan"
                className="rounded bg-amber-500 px-4 py-2 text-white"
                onClick={() => handleDecode(encodeTrackToken(cards[0].id))}
              >
                Simulate scan
              </button>
            )}
          </div>

          {!deps.mock && (
            <video
              ref={videoRef}
              className="mt-4 w-full max-w-sm rounded border"
              muted
              playsInline
            />
          )}

          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <li key={c.id} className="rounded border p-2 text-center">
                <img
                  src={c.qr}
                  alt=""
                  className="mx-auto"
                  width={120}
                  height={120}
                />
                <p className="mt-1 text-xs text-neutral-400">card</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nowPlaying && (
        <section
          className="mt-8 rounded-lg border p-5"
          data-testid="now-playing"
        >
          <p className="text-lg font-semibold">Now playing (hidden)</p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => deps.provider.pause()}
            >
              Pause
            </button>
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => deps.provider.stop()}
            >
              Stop
            </button>
            <button
              className="rounded bg-neutral-200 px-3 py-1"
              onClick={() => setRevealed(true)}
            >
              Reveal
            </button>
          </div>
          {revealed && (
            <p className="mt-3 text-sm" data-testid="reveal">
              {nowPlaying.title}, {nowPlaying.artist} (
              {nowPlaying.year ?? 'unknown'})
            </p>
          )}
        </section>
      )}
    </main>
  )
}
