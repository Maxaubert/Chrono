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
  onResume,
  onReplay,
  playing = true,
  titleOf,
  artistOf,
  imageOf,
  piled = false,
  interactive = true,
}: {
  state: GameState
  onPlace: (slotIndex: number) => void
  onPause: () => void
  onResume: () => void
  onReplay: () => void
  playing?: boolean
  titleOf?: (id: string) => string | undefined
  artistOf?: (id: string) => string | undefined
  imageOf?: (id: string) => string | null | undefined
  piled?: boolean
  interactive?: boolean
}) {
  return (
    <div className="game-screen">
      <GameBackground />
      <Overview
        players={state.players}
        currentIndex={state.currentPlayerIndex}
        target={state.config.targetCards}
      />
      <MysteryCard
        onPause={onPause}
        onResume={onResume}
        onReplay={onReplay}
        isPlaying={playing}
      />
      <Hand
        timeline={currentPlayer(state).timeline}
        onPlace={onPlace}
        titleOf={titleOf}
        artistOf={artistOf}
        imageOf={imageOf}
        piled={piled}
        interactive={interactive}
      />
    </div>
  )
}
