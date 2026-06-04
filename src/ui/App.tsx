// src/ui/App.tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  const spike = new URLSearchParams(window.location.search).get('spike') === '1'
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  if (spike) return <SpikeHarness />
  return (
    <ThemeProvider>
      {screen === 'menu' ? (
        <MenuScreen onPlay={() => setScreen('game')} />
      ) : (
        <GameContainer />
      )}
    </ThemeProvider>
  )
}
