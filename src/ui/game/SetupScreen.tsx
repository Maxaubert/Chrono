// src/ui/game/SetupScreen.tsx
import { useState } from 'react'
import { parsePlaylistId, type SpotifyTrack } from '@/spotify'
import type { SpotifySession } from './useSpotifySession'

export interface SetupResult {
  names: string[]
  targetCards: number
  tracks: SpotifyTrack[]
}

export default function SetupScreen({
  session,
  onStart,
}: {
  session: SpotifySession
  onStart: (result: SetupResult) => void
}) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState(10)
  const [playlist, setPlaylist] = useState('')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function setCountAndNames(n: number) {
    setCount(n)
    setNames((prev) => {
      const next = prev.slice(0, n)
      while (next.length < n) next.push('')
      return next
    })
  }

  async function importPlaylist() {
    setErr(null)
    setBusy(true)
    try {
      const id = session.mock ? 'mock' : parsePlaylistId(playlist)
      if (!id) throw new Error('Could not read a playlist id from that link.')
      setTracks(await session.importPlaylistId(id))
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  const ready =
    session.loggedIn &&
    session.connected &&
    tracks.length > 0 &&
    names.every((n) => n.trim().length > 0)

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold">New game</h1>
      {(err || session.error) && (
        <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800">
          {err ?? session.error}
        </p>
      )}

      {!session.mock && (
        <section className="mt-4 flex flex-wrap gap-2">
          {!session.loggedIn ? (
            <button
              className="rounded bg-green-600 px-3 py-2 text-white"
              onClick={session.login}
            >
              Log in with Spotify
            </button>
          ) : !session.connected ? (
            <button
              className="rounded bg-blue-600 px-3 py-2 text-white"
              onClick={session.connect}
            >
              Connect player
            </button>
          ) : (
            <span className="self-center text-sm text-green-700">
              Player ready
            </span>
          )}
        </section>
      )}

      <section className="mt-6">
        <label className="text-sm">Players: </label>
        <select
          data-testid="player-count"
          value={count}
          onChange={(e) => setCountAndNames(Number(e.target.value))}
        >
          {[2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className="mt-2 grid gap-2">
          {names.map((name, i) => (
            <input
              key={i}
              data-testid={`name-${i}`}
              className="rounded border px-2 py-1"
              placeholder={`Player ${i + 1} name`}
              value={name}
              onChange={(e) =>
                setNames((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-4">
        <label className="text-sm">Win at: </label>
        <input
          data-testid="target"
          type="number"
          className="w-20 rounded border px-2 py-1"
          value={target}
          min={2}
          onChange={(e) => setTarget(Number(e.target.value))}
        />{' '}
        cards
      </section>

      <section className="mt-4 flex gap-2">
        {!session.mock && (
          <input
            className="flex-1 rounded border px-2 py-1"
            placeholder="Spotify playlist link"
            value={playlist}
            onChange={(e) => setPlaylist(e.target.value)}
          />
        )}
        <button
          data-testid="import"
          className="rounded bg-neutral-800 px-3 py-2 text-white"
          onClick={importPlaylist}
          disabled={busy}
        >
          {busy ? 'Importing...' : 'Import playlist'}
        </button>
        {tracks.length > 0 && (
          <span className="self-center text-sm">{tracks.length} songs</span>
        )}
      </section>

      <button
        data-testid="start-game"
        className="mt-6 rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-40"
        disabled={!ready}
        onClick={() =>
          onStart({
            names: names.map((n) => n.trim()),
            targetCards: target,
            tracks,
          })
        }
      >
        Start game
      </button>
    </main>
  )
}
