import type { ComponentType } from 'react'
import type { GameState } from '@/core'
import { currentPlayer } from '@/core'
import GameBackground from './GameBackground'
import MobileOverview from './MobileOverview'
import MobileHand from './MobileHand'
import type { MysteryProps } from './adapter'
import './mobile-play.css'

/**
 * Phone layout for the in-game play screen. Same props as the desktop
 * {@link GameScreen} (GameScreen forks to this via useIsMobile). Instead of the
 * absolutely-positioned desktop overlays it stacks a compact scoreboard, the
 * game-supplied mystery card, and a tap-to-place rail in a vertical column.
 *
 * The root carries BOTH `mobile-game-screen` and `game-screen` classes: the
 * game-supplied mystery cards (Hitster disc/equalizer, History/Star Wars clue
 * cards) style their internals with `.game-screen .myst-*` / `.hist-myst` /
 * `.sd-myst` selectors, so keeping `game-screen` makes them render correctly.
 * `mobile-play.css` then overrides only the *layout* selectors
 * (`.mystery-wrap`, entrance animations) under the higher-specificity
 * `.mobile-game-screen` prefix, leaving desktop untouched.
 */
export default function MobileGameScreen({
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
    <div className="mobile-game-screen game-screen">
      <GameBackground />
      <div className="mgs-top">
        <MobileOverview
          players={state.players}
          currentIndex={state.currentPlayerIndex}
          target={state.config.targetCards}
        />
      </div>
      <div className="mgs-mystery mobile-mystery-slot">
        <Mystery
          drawn={state.drawn}
          isPlaying={playing}
          onPause={onPause}
          onResume={onResume}
          onReplay={onReplay}
        />
      </div>
      <div className="mgs-hand">
        <MobileHand
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
    </div>
  )
}
