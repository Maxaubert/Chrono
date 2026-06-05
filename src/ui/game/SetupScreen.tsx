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

/** A playlist the host has added to the game's pool. */
type Added = {
  id: string
  name: string
  image: string | null
  count: number
  tracks: SpotifyTrack[]
}

function dedupeTracks(list: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>()
  const out: SpotifyTrack[] = []
  for (const t of list) {
    if (!seen.has(t.id)) {
      seen.add(t.id)
      out.push(t)
    }
  }
  return out
}

/**
 * New-game setup, shown as a popup over the menu. Wizard:
 *   Gate    — log in to Spotify (required).
 *   Players — players + win target  -> NEXT
 *   Playlist— search + add one or more playlists -> START GAME
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
  const [step, setStep] = useState<'players' | 'playlist' | 'review'>('players')
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState(10)
  const [playlist, setPlaylist] = useState('')
  const [search, setSearch] = useState('')
  const [myPlaylists, setMyPlaylists] = useState<MyPlaylist[]>([])
  const [selected, setSelected] = useState<Added[]>([])
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

  async function addById(
    id: string,
    meta: { name: string; image: string | null },
  ) {
    if (selected.some((s) => s.id === id)) return
    setErr(null)
    setBusy(true)
    try {
      const tracks = await session.importPlaylistId(id)
      setSelected((prev) =>
        prev.some((s) => s.id === id)
          ? prev
          : [
              ...prev,
              {
                id,
                name: meta.name,
                image: meta.image,
                count: tracks.length,
                tracks,
              },
            ],
      )
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  function addPlaylist(p: MyPlaylist) {
    addById(p.id, { name: p.name, image: p.image })
  }

  async function addFromLink() {
    const id = session.mock ? 'mock' : parsePlaylistId(playlist)
    if (!id) return setErr('Could not read a playlist id from that link.')
    await addById(id, {
      name: session.mock ? 'Mock deck' : 'Imported playlist',
      image: null,
    })
    setPlaylist('')
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id))
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
  const combined = dedupeTracks(selected.flatMap((s) => s.tracks))
  const ready =
    session.loggedIn && session.connected && combined.length > 0 && namesReady
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
                max={20}
                value={target}
                onChange={(e) =>
                  setTarget(Math.min(20, Math.max(2, Number(e.target.value))))
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
            disabled={!namesReady}
            onClick={goNext}
          >
            <span>NEXT</span>
            <span className="su-k">&#9654;</span>
          </button>
        </main>
      </>
    )
  } else if (step === 'playlist') {
    const filtered = myPlaylists.filter((p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase()),
    )
    inner = (
      <>
        {rail(
          '// CHOOSE PLAYLISTS',
          'Add one or more playlists for your timeline.',
          <button className="su-back" onClick={() => setStep('players')}>
            &#9664; Back
          </button>,
        )}
        <main className="su-form">
          {errorBanner}

          <section className="su-section">
            <div className="su-label">Your Playlists</div>

            {!session.mock && (
              <input
                className="su-search"
                data-testid="playlist-search"
                placeholder="Search your playlists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}

            {!session.mock && (
              <div className="su-pl-list">
                {filtered.length === 0 && (
                  <div className="su-pl-empty">
                    {myPlaylists.length === 0
                      ? 'Loading your playlists...'
                      : 'No playlists match.'}
                  </div>
                )}
                {filtered.map((p) => {
                  const added = selected.some((s) => s.id === p.id)
                  return (
                    <div className="su-pl-row" key={p.id}>
                      <span className="su-pl-cover">
                        {p.image ? (
                          <img src={p.image} alt="" loading="lazy" />
                        ) : (
                          <span className="su-pl-noart">&#9834;</span>
                        )}
                      </span>
                      <span className="su-pl-name">
                        {p.name}
                        <span className="su-pl-by">
                          by {p.ownerName} &middot; {p.trackCount} songs
                        </span>
                      </span>
                      <button
                        className="su-use"
                        disabled={busy || added}
                        onClick={() => addPlaylist(p)}
                      >
                        {added ? 'ADDED' : 'ADD'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* import a link (under the playlists) */}
            <div className="su-inputrow">
              {!session.mock && (
                <input
                  className="su-input"
                  placeholder="Or paste a Spotify playlist link"
                  value={playlist}
                  onChange={(e) => setPlaylist(e.target.value)}
                />
              )}
              <button
                className="su-import"
                data-testid="import"
                onClick={addFromLink}
                disabled={busy}
              >
                {busy ? 'ADDING...' : 'IMPORT'}
              </button>
            </div>
          </section>

          {selected.length > 0 && (
            <section className="su-section su-selected">
              <div className="su-label">
                Added &middot; {combined.length} songs
              </div>
              <div className="su-pl-list">
                {selected.map((s) => (
                  <div className="su-pl-row" key={s.id}>
                    <span className="su-pl-cover">
                      {s.image ? (
                        <img src={s.image} alt="" loading="lazy" />
                      ) : (
                        <span className="su-pl-noart">&#9834;</span>
                      )}
                    </span>
                    <span className="su-pl-name">
                      {s.name}
                      <span className="su-pl-by">{s.count} songs</span>
                    </span>
                    <button
                      className="su-remove"
                      data-testid={`remove-${s.id}`}
                      aria-label={`Remove ${s.name}`}
                      onClick={() => removeSelected(s.id)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <button
            className="su-next"
            data-testid="review-next"
            disabled={combined.length === 0}
            onClick={() => setStep('review')}
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
          '// REVIEW',
          'Everything set? Start the game.',
          <button className="su-back" onClick={() => setStep('playlist')}>
            &#9664; Back
          </button>,
        )}
        <main className="su-form">
          {errorBanner}

          <section className="su-section">
            <div className="su-label">Players</div>
            <div className="su-names">
              {names.map((name, i) => (
                <div className="su-name su-rv-name" key={i}>
                  <span className="su-name-idx">P{i + 1}</span>
                  <span>{name.trim() || `Player ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="su-section">
            <div className="su-label">Win Condition</div>
            <div className="su-rv-win">
              First to <strong>{target}</strong> cards wins
            </div>
          </section>

          <section className="su-section su-selected">
            <div className="su-label">
              Playlists &middot; {combined.length} songs
            </div>
            <div className="su-pl-list">
              {selected.map((s) => (
                <div className="su-pl-row" key={s.id}>
                  <span className="su-pl-cover">
                    {s.image ? (
                      <img src={s.image} alt="" loading="lazy" />
                    ) : (
                      <span className="su-pl-noart">&#9834;</span>
                    )}
                  </span>
                  <span className="su-pl-name">
                    {s.name}
                    <span className="su-pl-by">{s.count} songs</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <button
            className="su-start"
            data-testid="start-game"
            disabled={!ready}
            onClick={() =>
              onStart({
                names: names.map((n) => n.trim()),
                targetCards: target,
                tracks: combined,
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
