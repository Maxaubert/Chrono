// src/ui/game/SetupScreen.tsx
import { useState } from 'react'
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
 * Two-step new-game setup, cyberpunk HUD (layout D):
 *   Step 1 — Spotify login + players + win target  -> NEXT
 *   Step 2 — playlist (auto-fetches your playlists) -> START GAME
 * Step 2 is a temporary working screen; it gets its own redesign later.
 */
export default function SetupScreen({
  session,
  onStart,
}: {
  session: SpotifySession
  onStart: (result: SetupResult) => void
}) {
  const { game } = useActiveGame()
  const [step, setStep] = useState<1 | 2>(1)
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

  const namesReady = names.every((n) => n.trim().length > 0)
  const canNext = (session.mock || session.loggedIn) && namesReady
  const ready =
    session.loggedIn && session.connected && tracks.length > 0 && namesReady

  // Advancing to the playlist step auto-fetches the host's playlists.
  function goNext() {
    if (!session.mock && session.loggedIn && myPlaylists.length === 0) {
      showMyPlaylists()
    }
    setStep(2)
  }

  // ---------------------------------------------------------------- step 1
  if (step === 1) {
    return (
      <div className="setup-screen">
        <div className="su-frame">
          <aside className="su-rail">
            <span className="su-slash su-slash-tl" />
            <span className="su-slash su-slash-br" />
            <div>
              <div className="su-kicker">// NEW GAME</div>
              <div className="su-wordmark">{game.theme.title}</div>
              <div className="su-blurb">{game.theme.tagline}</div>
            </div>
            <div className="su-fan" aria-hidden="true">
              <div className="su-card su-card-1" />
              <div className="su-card su-card-2" />
              <div className="su-card su-card-3" />
            </div>
            <div className="su-foot">
              <span className="su-dot" /> LOCAL &middot; PASS &amp; PLAY
            </div>
          </aside>

          <main className="su-form">
            {(err || session.error) && (
              <div className="su-error">{err ?? session.error}</div>
            )}

            {!session.mock && (
              <section className="su-section su-row">
                <div className="su-label">Spotify</div>
                {!session.loggedIn ? (
                  <button className="su-login" onClick={session.login}>
                    LOG IN WITH SPOTIFY
                  </button>
                ) : (
                  <div className="su-row" style={{ gap: 16 }}>
                    <span className="su-linked">Linked</span>
                    <button className="su-logout" onClick={session.logout}>
                      Log out
                    </button>
                  </div>
                )}
              </section>
            )}

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
                  onChange={(e) =>
                    setTarget(Math.max(2, Number(e.target.value)))
                  }
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
              disabled={!canNext}
              onClick={goNext}
            >
              <span>NEXT</span>
              <span className="su-k">&#9654;</span>
            </button>
          </main>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------- step 2
  return (
    <div className="setup-screen">
      <div className="su-frame">
        <aside className="su-rail">
          <span className="su-slash su-slash-tl" />
          <span className="su-slash su-slash-br" />
          <div>
            <div className="su-kicker">// CHOOSE PLAYLIST</div>
            <div className="su-wordmark">{game.theme.title}</div>
            <div className="su-blurb">
              Pick the soundtrack for your timeline.
            </div>
          </div>
          <div className="su-fan" aria-hidden="true">
            <div className="su-card su-card-1" />
            <div className="su-card su-card-2" />
            <div className="su-card su-card-3" />
          </div>
          <button className="su-back" onClick={() => setStep(1)}>
            &#9664; Back
          </button>
        </aside>

        <main className="su-form">
          {(err || session.error) && (
            <div className="su-error">{err ?? session.error}</div>
          )}

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
                      {p.name}{' '}
                      <span className="su-pl-by">by {p.ownerName}</span>
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
      </div>
    </div>
  )
}
