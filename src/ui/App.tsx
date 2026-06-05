// src/ui/App.tsx
import { useEffect, useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'
import SetupScreen, { type SetupResult } from './game/SetupScreen'
import { useSpotifySession } from './game/useSpotifySession'
import { clearResumeSetup, peekResumeSetup } from './game/resumeSetup'
import ScreenTransition from './transition/ScreenTransition'
import { ThemeProvider } from './theme/ThemeProvider'

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
 * into the actual game.
 */
function GameRoot() {
  // Guest mode (no Spotify login, QR playback). Chosen from the setup gate, or
  // forced via ?guest=1 (used by the E2E flow).
  const [guest, setGuest] = useState(
    () => new URLSearchParams(window.location.search).get('guest') === '1',
  )
  const session = useSpotifySession(guest)
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  // Returning from the Spotify auth redirect: reopen setup where the host left
  // off, instead of the menu the fresh page load would otherwise show. The flag
  // is read in the initializer and cleared once in the effect below.
  const [setupOpen, setSetupOpen] = useState(peekResumeSetup)
  const [transitioning, setTransitioning] = useState(false)
  const [setup, setSetup] = useState<SetupResult | null>(null)

  useEffect(() => {
    clearResumeSetup()
  }, [])

  return (
    <>
      {screen === 'menu' ? (
        <>
          <MenuScreen onPlay={() => setSetupOpen(true)} />
          {setupOpen && (
            <SetupScreen
              session={session}
              onClose={() => setSetupOpen(false)}
              onGuest={() => setGuest(true)}
              onStart={(result) => {
                setSetup(result)
                setTransitioning(true)
              }}
            />
          )}
        </>
      ) : (
        setup && <GameContainer session={session} setup={setup} />
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
