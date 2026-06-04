// src/ui/App.tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'
import HCardShowcase from './menu/hcard/HCardShowcase'
import RealArtDemo from './menu/hcard/RealArtDemo'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const spike = params.get('spike') === '1'
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  if (params.get('hcard') === '1') return <HCardShowcase />
  if (params.get('artdemo') === '1') return <RealArtDemo />
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
