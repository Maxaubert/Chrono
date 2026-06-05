import type { GameState } from '@/core'
import { currentPlayer } from '@/core'
import GameBackground from './GameBackground'
import Overview from './Overview'
import MysteryCard from './MysteryCard'
import Hand from './Hand'
import './game-screen.css'

export default function GameScreen({
  state,
  onPlace,
  onPause,
  onReplay,
  titleOf,
  piled = false,
  isPlaying = true,
  playEpoch = 0,
  analysisEnabled = false,
}: {
  state: GameState
  onPlace: (slotIndex: number) => void
  onPause: () => void
  onReplay: () => void
  titleOf?: (id: string) => string | undefined
  piled?: boolean
  isPlaying?: boolean
  playEpoch?: number
  analysisEnabled?: boolean
}) {
  return (
    <div className="game-screen">
      <GameBackground
        trackId={state.drawn?.card.id}
        isPlaying={isPlaying}
        playEpoch={playEpoch}
        analysisEnabled={analysisEnabled}
      />
      <Overview
        players={state.players}
        currentIndex={state.currentPlayerIndex}
        target={state.config.targetCards}
      />
      <MysteryCard onPause={onPause} onReplay={onReplay} />
      <Hand
        timeline={currentPlayer(state).timeline}
        onPlace={onPlace}
        titleOf={titleOf}
        piled={piled}
      />
    </div>
  )
}
