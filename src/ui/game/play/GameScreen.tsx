import type { ComponentType } from 'react'
import type { GameState } from '@/core'
import { currentPlayer } from '@/core'
import GameBackground from './GameBackground'
import Overview from './Overview'
import Hand from './Hand'
import type { MysteryProps } from './adapter'
import './game-screen.css'

export default function GameScreen({
  state,
  Mystery,
  onPlace,
  onPause,
  onResume,
  onReplay,
  playing = true,
  titleOf,
  artistOf,
  imageOf,
  labelOf,
  piled = false,
  interactive = true,
}: {
  state: GameState
  Mystery: ComponentType<MysteryProps>
  onPlace: (slotIndex: number) => void
  onPause: () => void
  onResume: () => void
  onReplay: () => void
  playing?: boolean
  titleOf?: (id: string) => string | undefined
  artistOf?: (id: string) => string | undefined
  imageOf?: (id: string) => string | null | undefined
  labelOf?: (id: string) => string | undefined
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
      <Mystery
        drawn={state.drawn}
        isPlaying={playing}
        onPause={onPause}
        onResume={onResume}
        onReplay={onReplay}
      />
      <Hand
        timeline={currentPlayer(state).timeline}
        onPlace={onPlace}
        titleOf={titleOf}
        artistOf={artistOf}
        imageOf={imageOf}
        labelOf={labelOf}
        piled={piled}
        interactive={interactive}
      />
    </div>
  )
}
