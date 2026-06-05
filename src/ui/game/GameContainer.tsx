// src/ui/game/GameContainer.tsx
import { useEffect, useRef, useState } from 'react'
import { isWon, startGame, type Card } from '@/core'
import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from './deck'
import { useGame } from './useGame'
import type { SpotifySession } from './useSpotifySession'
import type { SetupResult } from './SetupScreen'
import TurnScreen from './TurnScreen'
import RevealPanel from './RevealPanel'
import WinScreen from './WinScreen'

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
  const [error, setError] = useState<string | null>(null)

  function play(uri: string) {
    session.provider.play({ uri }).catch((e) => setError(String(e)))
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

  async function next() {
    if (!state) return
    // If this turn just won the game, stop the music and end here, do not draw
    // or play another song.
    const player = state.players[state.currentPlayerIndex]
    if (player.timeline.length >= state.config.targetCards) {
      session.provider.stop().catch(() => {})
      dispatch({ type: 'advance', nextDrawn: null })
      return
    }
    const nextDrawn = await drawNext()
    dispatch({ type: 'advance', nextDrawn })
    if (nextDrawn) play(`spotify:track:${nextDrawn.card.id}`)
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
    <div>
      {(error || session.error) && (
        <p className="mx-auto mt-4 max-w-2xl rounded bg-red-100 p-2 text-center text-sm text-red-800">
          {error ?? session.error}
        </p>
      )}
      {state.phase === 'listening' ? (
        <TurnScreen
          state={state}
          onPlace={(slot) => dispatch({ type: 'place', slotIndex: slot })}
          onPause={() => session.provider.pause()}
          onReplay={() =>
            state.drawn && play(`spotify:track:${state.drawn.card.id}`)
          }
        />
      ) : (
        <RevealPanel state={state} onNext={next} />
      )}
    </div>
  )
}
