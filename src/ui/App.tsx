// src/ui/App.tsx
import SpikeHarness from './SpikeHarness'
import GameContainer from './game/GameContainer'

export default function App() {
  const spike = new URLSearchParams(window.location.search).get('spike') === '1'
  return spike ? <SpikeHarness /> : <GameContainer />
}
