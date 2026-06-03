// src/ui/game/GameContainer.tsx
import { useRef, useState } from 'react'
import { isWon, startGame, type Card } from '@/core'
import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from './deck'
import { useGame } from './useGame'
import { useSpotifySession } from './useSpotifySession'
import SetupScreen, { type SetupResult } from './SetupScreen'
import TurnScreen from './TurnScreen'
import RevealPanel from './RevealPanel'
import WinScreen from './WinScreen'

export default function GameContainer() {
  const session = useSpotifySession()
  const [state, dispatch] = useGame()
  const remaining = useRef<SpotifyTrack[]>([])
  const [error, setError] = useState<string | null>(null)

  function play(uri: string) {
    session.provider.play({ uri }).catch((e) => setError(String(e)))
  }

  async function drawNext() {
    const result = await takeNextDrawn(remaining.current, session.fetchYear)
    remaining.current = result.remaining
    return result.drawn
  }

  async function start(setup: SetupResult) {
    setError(null)
    try {
      remaining.current = buildDeck(setup.tracks, Math.random)
      const anchors: Card[] = []
      for (let i = 0; i < setup.names.length; i++) {
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
          { targetCards: setup.targetCards },
          setup.names.map((name, i) => ({ id: `p${i}`, name })),
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
    const nextDrawn = await drawNext()
    dispatch({ type: 'advance', nextDrawn })
    if (nextDrawn) play(`spotify:track:${nextDrawn.card.id}`)
  }

  if (!state) return <SetupScreen session={session} onStart={start} />
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
