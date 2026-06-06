// src/ui/App.tsx
import { useEffect, useMemo, useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'
import { useSpotifySession } from './game/useSpotifySession'
import { makeHitsterPlay } from './game/hitster/play'
import { makeHistoryPlay } from './game/history/play'
import { clearResumeSetup, peekResumeSetup } from './game/resumeSetup'
import type { GamePlay, GameSetupResult } from './game/play/adapter'
import ScreenTransition from './transition/ScreenTransition'
import { ThemeProvider } from './theme/ThemeProvider'
import { useActiveGame } from './theme/activeGameContext'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('spike') === '1') return <SpikeHarness />
  return (
    <ThemeProvider>
      <GameRoot />
    </ThemeProvider>
  )
}

/**
 * The main flow: menu with a Setup popup, then the game. PLAY opens the Setup
 * popup over the menu; START hands back the setup and runs the wipe transition
 * into the actual game. The active game's `play` adapter supplies setup, deck,
 * mystery, and audio.
 */
function GameRoot() {
  // Guest mode (no Spotify login, in-page preview clips). Chosen from the setup
  // gate, or forced via ?guest=1 (used by the E2E flow).
  const [guest, setGuest] = useState(
    () => new URLSearchParams(window.location.search).get('guest') === '1',
  )
  const session = useSpotifySession(guest)
  const { game } = useActiveGame()
  const [setup, setSetup] = useState<GameSetupResult | null>(null)
  // useSpotifySession returns a fresh object each render; rebuild the adapter
  // when the active game, the provider identity (mock/guest), OR the reactive
  // session state the setup screen reads (loggedIn/connected/error) changes --
  // otherwise the Hitster Setup captures a stale session and never sees the
  // playback device connect, leaving START greyed out forever.
  const computedPlay = useMemo(
    () =>
      game.id === 'history' ? makeHistoryPlay() : makeHitsterPlay(session),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      game.id,
      session.mock,
      guest,
      session.loggedIn,
      session.connected,
      session.error,
    ],
  )
  // Freeze the adapter once setup is captured (START pressed, see onStart below).
  // Hitster stashes the chosen tracks inside the adapter, so a session-state
  // change in the gap between START and dealing (a delayed SDK error, a connect
  // retry) must not rebuild it and wipe the deck -- which would dead-end on
  // "Dealing the deck...".
  const [frozenPlay, setFrozenPlay] = useState<GamePlay | null>(null)
  const play = frozenPlay ?? computedPlay
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  // Returning from the Spotify auth redirect: reopen setup where the host left
  // off, instead of the menu the fresh page load would otherwise show. The flag
  // is read in the initializer and cleared once in the effect below.
  const [setupOpen, setSetupOpen] = useState(peekResumeSetup)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    clearResumeSetup()
  }, [])

  return (
    <>
      {screen === 'menu' ? (
        <>
          <MenuScreen onPlay={() => setSetupOpen(true)} />
          {setupOpen && (
            <play.Setup
              onClose={() => setSetupOpen(false)}
              onGuest={() => setGuest(true)}
              onStart={(result) => {
                setFrozenPlay(play) // lock the adapter holding the chosen tracks
                setSetup(result)
                setTransitioning(true)
              }}
            />
          )}
        </>
      ) : (
        setup && (
          <>
            {/* Spotify errors are Hitster-only; History never touches the session. */}
            {game.id !== 'history' && session.error && (
              <p className="reveal-err">{session.error}</p>
            )}
            <GameContainer play={play} setupResult={setup} />
          </>
        )
      )}

      {transitioning && (
        <ScreenTransition
          onCover={() => {
            setScreen('game')
            setSetupOpen(false)
          }}
          onDone={() => setTransitioning(false)}
        />
      )}
    </>
  )
}
