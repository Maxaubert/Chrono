// src/ui/game/GameContainer.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { isWon, startGame, type Card } from '@/core'
import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from './deck'
import { useGame } from './useGame'
import type { SpotifySession } from './useSpotifySession'
import type { SetupResult } from './SetupScreen'
import GameScreen from './play/GameScreen'
import RevealOverlay from './play/RevealOverlay'
import TurnSwitch from './play/TurnSwitch'
import WinScreen from './play/WinScreen'

/**
 * Runs an in-progress game. The setup (players, target, tracks) is collected in
 * the menu's Setup popup and handed in; the game starts on mount.
 */
export default function GameContainer({
  session,
  setup,
}: {
  session: SpotifySession
  setup: SetupResult
}) {
  const [state, dispatch] = useGame()
  const remaining = useRef<SpotifyTrack[]>([])
  const started = useRef(false)
  const timers = useRef<number[]>([])

  // setTimeout that registers its id so every pending choreography timer can be
  // cleared on unmount (e.g. a future "quit to menu"), instead of firing against
  // a torn-down tree.
  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    },
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [piled, setPiled] = useState(false)
  const [ending, setEnding] = useState(false) // post-OK turn-end sequence
  const [switching, setSwitching] = useState(false)
  const [nextName, setNextName] = useState('')
  const [playing, setPlaying] = useState(true) // mystery track play/pause

  const trackInfo = useMemo(() => {
    const m = new Map<
      string,
      { title: string; artist: string; image: string | null }
    >()
    for (const t of setup.tracks)
      m.set(t.id, { title: t.title, artist: t.artist, image: t.image })
    return m
  }, [setup.tracks])
  const titleOf = (id: string) => trackInfo.get(id)?.title
  const artistOf = (id: string) => trackInfo.get(id)?.artist
  const imageOf = (id: string) => trackInfo.get(id)?.image ?? undefined

  function play(uri: string) {
    // Optimistically show the playing state, but undo it if the provider
    // rejects (device gone, 404) so the card never shows a spinning disc /
    // pause icon while nothing is actually playing.
    setPlaying(true)
    session.provider.play({ uri }).catch((e) => {
      setError(String(e))
      setPlaying(false)
    })
  }

  async function drawNext() {
    const result = await takeNextDrawn(remaining.current, session.fetchYear)
    remaining.current = result.remaining
    return result.drawn
  }

  async function start(s: SetupResult) {
    setError(null)
    try {
      remaining.current = buildDeck(s.tracks, Math.random)
      const anchors: Card[] = []
      for (let i = 0; i < s.names.length; i++) {
        const drawn = await drawNext()
        if (!drawn)
          throw new Error('Not enough playable songs in the playlist.')
        anchors.push(drawn.card)
      }
      const first = await drawNext()
      if (!first) throw new Error('Not enough playable songs in the playlist.')
      dispatch({
        type: 'start',
        state: startGame(
          { targetCards: s.targetCards },
          s.names.map((name, i) => ({ id: `p${i}`, name })),
          anchors,
          first,
        ),
      })
      play(`spotify:track:${first.card.id}`)
    } catch (e) {
      setError(String(e))
    }
  }

  // The reveal's OK button starts the turn-end choreography:
  // show the placed card in the deck -> pile -> "next player" cover (swap behind
  // it) -> deal the next player's hand. If the turn won, go to the win screen.
  function beginEndTurn() {
    if (!state) return
    const cur = state
    const player = cur.players[cur.currentPlayerIndex]
    const won = player.timeline.length >= cur.config.targetCards
    setEnding(true) // hides the reveal; the hand shows the placed card
    if (won) {
      schedule(() => {
        session.provider.stop().catch(() => {})
        dispatch({ type: 'advance', nextDrawn: null }) // -> won -> WinScreen
        setEnding(false)
      }, 1100)
      return
    }
    schedule(() => {
      const nextIdx = (cur.currentPlayerIndex + 1) % cur.players.length
      setNextName(cur.players[nextIdx].name)
      setPiled(true) // collapse the hand into a pile
      schedule(() => setSwitching(true), 600) // then cover for the swap
    }, 1100)
  }

  async function switchCovered() {
    const nextDrawn = await drawNext()
    dispatch({ type: 'advance', nextDrawn })
    if (nextDrawn) play(`spotify:track:${nextDrawn.card.id}`)
  }
  function switchDone() {
    setSwitching(false)
    setPiled(false) // deal: the next player's pile spreads into their hand
    setEnding(false)
  }

  // Start the game once, from the setup handed in by the menu.
  useEffect(() => {
    if (started.current) return
    started.current = true
    start(setup)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state)
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg, #08060f)',
          color: 'var(--accent, #9a6bff)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          letterSpacing: '0.3em',
          fontSize: 14,
          textTransform: 'uppercase',
          padding: 24,
          textAlign: 'center',
        }}
      >
        {error ?? 'Dealing the deck...'}
      </div>
    )

  if (isWon(state))
    return (
      <WinScreen state={state} onPlayAgain={() => window.location.reload()} />
    )

  return (
    <>
      {(error || session.error) && (
        <p className="reveal-err">{error ?? session.error}</p>
      )}
      <GameScreen
        state={state}
        titleOf={titleOf}
        artistOf={artistOf}
        imageOf={imageOf}
        piled={piled}
        interactive={!ending && !switching}
        playing={playing}
        qr={session.guest}
        onPlace={(slot) => dispatch({ type: 'place', slotIndex: slot })}
        onPause={() => {
          session.provider.pause().catch(() => {})
          setPlaying(false)
        }}
        onResume={() => {
          session.provider.resume().catch((e) => setError(String(e)))
          setPlaying(true)
        }}
        onReplay={() =>
          state.drawn && play(`spotify:track:${state.drawn.card.id}`)
        }
      />
      {state.phase === 'revealed' && !ending && (
        <RevealOverlay
          state={state}
          image={state.drawn ? imageOf(state.drawn.card.id) : undefined}
          onNext={beginEndTurn}
        />
      )}
      {switching && (
        <TurnSwitch
          name={nextName}
          onCovered={() => void switchCovered()}
          onDone={switchDone}
        />
      )}
    </>
  )
}
