// src/ui/App.tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'

export default function App() {
  const spike = new URLSearchParams(window.location.search).get('spike') === '1'
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  if (spike) return <SpikeHarness />
  if (screen === 'menu') return <MenuScreen onPlay={() => setScreen('game')} />
  return <GameContainer />
}
