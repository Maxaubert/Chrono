// src/ui/App.tsx
import { useState } from 'react'
import SpikeHarness from './SpikeHarness'
import MenuScreen from './menu/MenuScreen'
import GameContainer from './game/GameContainer'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const spike = params.get('spike') === '1'
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  if (spike) return <SpikeHarness />
  if (screen === 'menu') return <MenuScreen onPlay={() => setScreen('game')} />
  return <GameContainer />
}
