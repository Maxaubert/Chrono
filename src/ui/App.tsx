// src/ui/App.tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'
import SetupScreen, { type SetupResult } from './game/SetupScreen'
import { useSpotifySession } from './game/useSpotifySession'
import HCardShowcase from './menu/hcard/HCardShowcase'
import RealArtDemo from './menu/hcard/RealArtDemo'
import ScreenTransition from './transition/ScreenTransition'
import SetupMockShowcase from './setupmock/SetupMockShowcase'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('hcard') === '1') return <HCardShowcase />
  if (params.get('artdemo') === '1') return <RealArtDemo />
  if (params.get('setupmock') === '1') return <SetupMockShowcase />
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
  const session = useSpotifySession()
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  const [setupOpen, setSetupOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [setup, setSetup] = useState<SetupResult | null>(null)

  return (
    <>
      {screen === 'menu' ? (
        <>
          <MenuScreen onPlay={() => setSetupOpen(true)} />
          {setupOpen && (
            <SetupScreen
              session={session}
              onClose={() => setSetupOpen(false)}
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
