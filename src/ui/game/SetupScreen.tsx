// src/ui/game/SetupScreen.tsx
import { useState, type ReactNode } from 'react'
import { parsePlaylistId, type MyPlaylist, type SpotifyTrack } from '@/spotify'
import { useActiveGame } from '../theme/activeGameContext'
import type { SpotifySession } from './useSpotifySession'
import './setup.css'

export interface SetupResult {
  names: string[]
  targetCards: number
  tracks: SpotifyTrack[]
}

/**
 * New-game setup, shown as a popup over the menu. Wizard:
 *   Gate    — if Spotify isn't connected, the only option is to log in.
 *   Players — players + win target  -> NEXT
 *   Playlist— playlist (auto-fetches your playlists) -> START GAME
 * START hands the result back; the caller runs the load-in transition.
 */
export default function SetupScreen({
  session,
  onStart,
  onClose,
}: {
  session: SpotifySession
  onStart: (result: SetupResult) => void
  onClose?: () => void
}) {
  const { game } = useActiveGame()
  const [step, setStep] = useState<'players' | 'playlist'>('players')
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState(10)
  const [playlist, setPlaylist] = useState('')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [myPlaylists, setMyPlaylists] = useState<MyPlaylist[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function setCountAndNames(n: number) {
    const c = Math.min(6, Math.max(2, n))
    setCount(c)
    setNames((prev) => {
      const next = prev.slice(0, c)
      while (next.length < c) next.push('')
      return next
    })
  }

  async function importById(id: string) {
    setErr(null)
    setBusy(true)
    try {
      setTracks(await session.importPlaylistId(id))
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  async function importFromLink() {
    const id = session.mock ? 'mock' : parsePlaylistId(playlist)
    if (!id) return setErr('Could not read a playlist id from that link.')
    await importById(id)
  }

  async function showMyPlaylists() {
    setErr(null)
    try {
      setMyPlaylists(await session.loadMyPlaylists())
    } catch (e) {
      setErr(String(e))
    }
  }

  // Advancing to the playlist step auto-fetches the host's playlists.
  function goNext() {
    if (!session.mock && session.loggedIn && myPlaylists.length === 0) {
      showMyPlaylists()
    }
    setStep('playlist')
  }

  const namesReady = names.every((n) => n.trim().length > 0)
  const ready =
    session.loggedIn && session.connected && tracks.length > 0 && namesReady
  const needLogin = !session.mock && !session.loggedIn

  const errorBanner = (err || session.error) && (
    <div className="su-error">{err ?? session.error}</div>
  )

  function rail(kicker: string, blurb: string, foot: ReactNode) {
    return (
      <aside className="su-rail">
        <span className="su-slash su-slash-tl" />
        <span className="su-slash su-slash-br" />
        <div>
          <div className="su-kicker">{kicker}</div>
          <div className="su-wordmark">{game.theme.title}</div>
          <div className="su-blurb">{blurb}</div>
        </div>
        <div className="su-fan" aria-hidden="true">
          <div className="su-card su-card-1" />
          <div className="su-card su-card-2" />
          <div className="su-card su-card-3" />
        </div>
        <div className="su-foot">{foot}</div>
      </aside>
    )
  }

  let inner: ReactNode

  if (needLogin) {
    inner = (
      <>
        {rail(
          '// CONNECT',
          'Full tracks play in your browser, so the host signs in.',
          <>
            <span className="su-dot" /> SPOTIFY PREMIUM
          </>,
        )}
        <main className="su-form su-gate">
          {errorBanner}
          <div className="su-gate-msg">
            <div className="su-label">Spotify</div>
            <h2 className="su-gate-title">Connect Spotify to play</h2>
            <p className="su-gate-sub">
              {game.theme.title} needs your Spotify (Premium) to play the songs.
              Only the host logs in, players just pass the device.
            </p>
            <button
              className="su-login su-login-big"
              data-testid="spotify-login"
              onClick={session.login}
            >
              LOG IN WITH SPOTIFY
            </button>
          </div>
        </main>
      </>
    )
  } else if (step === 'players') {
    inner = (
      <>
        {rail(
          '// NEW GAME',
          game.theme.tagline,
          <>
            <span className="su-dot" /> LOCAL &middot; PASS &amp; PLAY
            {!session.mock && (
              <button className="su-foot-logout" onClick={session.logout}>
                Log out
              </button>
            )}
          </>,
        )}
        <main className="su-form">
          {errorBanner}

          <section className="su-section">
            <div className="su-label">Players</div>
            <div className="su-stepper">
              <button
                className="su-step-btn"
                data-testid="player-minus"
                disabled={count <= 2}
                onClick={() => setCountAndNames(count - 1)}
              >
                &minus;
              </button>
              <div className="su-step-val">
                {count}
                <span className="su-step-unit">/ 6</span>
              </div>
              <button
                className="su-step-btn"
                data-testid="player-plus"
                disabled={count >= 6}
                onClick={() => setCountAndNames(count + 1)}
              >
                +
              </button>
            </div>
            <div className="su-names">
              {names.map((name, i) => (
                <label className="su-name" key={i}>
                  <span className="su-name-idx">P{i + 1}</span>
                  <input
                    data-testid={`name-${i}`}
                    placeholder={`Player ${i + 1}`}
                    value={name}
                    onChange={(e) =>
                      setNames((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="su-section">
            <div className="su-label">Win At</div>
            <div className="su-winrow">
              <input
                className="su-win"
                data-testid="target"
                type="number"
                min={2}
                value={target}
                onChange={(e) => setTarget(Math.max(2, Number(e.target.value)))}
              />
              <span className="su-win-sub">cards to win</span>
              <input
                className="su-slider"
                type="range"
                min={2}
                max={20}
                value={Math.min(20, target)}
                onChange={(e) => setTarget(Number(e.target.value))}
                aria-label="cards to win"
              />
            </div>
          </section>

          <button
            className="su-next"
            data-testid="setup-next"
            disabled={!namesReady}
            onClick={goNext}
          >
            <span>NEXT</span>
            <span className="su-k">&#9654;</span>
          </button>
        </main>
      </>
    )
  } else {
    inner = (
      <>
        {rail(
          '// CHOOSE PLAYLIST',
          'Pick the soundtrack for your timeline.',
          <button className="su-back" onClick={() => setStep('players')}>
            &#9664; Back
          </button>,
        )}
        <main className="su-form">
          {errorBanner}

          <section className="su-section">
            <div className="su-label">Playlist</div>
            <div className="su-inputrow">
              {!session.mock && (
                <input
                  className="su-input"
                  placeholder="Spotify playlist link"
                  value={playlist}
                  onChange={(e) => setPlaylist(e.target.value)}
                />
              )}
              <button
                className="su-import"
                data-testid="import"
                onClick={importFromLink}
                disabled={busy}
              >
                {busy ? 'IMPORTING...' : 'IMPORT'}
              </button>
            </div>
            <div className="su-pl-meta">
              {!session.mock && (
                <button
                  className="su-mine"
                  data-testid="show-my-playlists"
                  onClick={showMyPlaylists}
                >
                  MY PLAYLISTS
                </button>
              )}
              {tracks.length > 0 && (
                <span className="su-count">
                  <span className="su-count-num">{tracks.length}</span> SONGS
                </span>
              )}
            </div>

            {myPlaylists.length > 0 && (
              <div className="su-pl-list">
                {myPlaylists.map((p) => (
                  <div className="su-pl-row" key={p.id}>
                    <span className="su-pl-name">
                      {p.name} <span className="su-pl-by">by {p.ownerName}</span>
                    </span>
                    <button
                      className="su-use"
                      disabled={busy}
                      onClick={() => importById(p.id)}
                    >
                      USE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button
            className="su-start"
            data-testid="start-game"
            disabled={!ready}
            onClick={() =>
              onStart({
                names: names.map((n) => n.trim()),
                targetCards: target,
                tracks,
              })
            }
          >
            <span>START GAME</span>
            <span className="su-k">&#9654;</span>
          </button>
        </main>
      </>
    )
  }

  return (
    <div
      className="setup-screen"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="su-frame">
        {onClose && (
          <button
            className="su-close"
            data-testid="setup-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        )}
        {inner}
      </div>
    </div>
  )
}
