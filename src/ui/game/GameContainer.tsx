// src/ui/game/GameContainer.tsx
import { useEffect, useRef, useState } from 'react'
import { isWon, startGame, type Card, type DrawnCard } from '@/core'
import { useGame } from './useGame'
import type { DeckHandle, GamePlay, GameSetupResult } from './play/adapter'
import GameScreen from './play/GameScreen'
import RevealOverlay from './play/RevealOverlay'
import TurnSwitch from './play/TurnSwitch'
import WinScreen from './play/WinScreen'

/**
 * Runs an in-progress game. The setup (players, target) is collected in the
 * menu's Setup popup and handed in; the game starts on mount. All game-specific
 * sourcing (deck, audio, card content) flows through the GamePlay adapter.
 */
export default function GameContainer({
  play,
  setupResult,
}: {
  play: GamePlay
  setupResult: GameSetupResult
}) {
  const [state, dispatch] = useGame()
  const deck = useRef<DeckHandle | null>(null)
  const started = useRef(false)
  const timers = useRef<number[]>([])
  // Guards the reveal "OK" against a double-tap: setEnding is async, so without
  // a synchronous flag a fast double-click would schedule the turn-end twice
  // (double draw/advance -> skipped player, burned card).
  const endingStarted = useRef(false)

  // Card id -> reveal content, recorded on each draw so a card's image/title/
  // artist survive after it is placed and `state.drawn` moves to the next card.
  const imageById = useRef(new Map<string, string | undefined>())
  const titleById = useRef(new Map<string, string | undefined>())
  const artistById = useRef(new Map<string, string | undefined>())

  // setTimeout that registers its id so every pending choreography timer can be
  // cleared on unmount (e.g. a future "quit to menu"), instead of firing against
  // a torn-down tree.
  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    },
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [piled, setPiled] = useState(false)
  const [ending, setEnding] = useState(false) // post-OK turn-end sequence
  const [switching, setSwitching] = useState(false)
  const [nextName, setNextName] = useState('')
  const [playing, setPlaying] = useState(true) // mystery play/pause

  const imageOf = (id: string) => imageById.current.get(id)
  const titleOf = (id: string) => titleById.current.get(id)
  const artistOf = (id: string) => artistById.current.get(id)

  // Record a drawn card's reveal content so its metadata survives placement.
  function record(drawn: DrawnCard | null) {
    if (!drawn) return
    imageById.current.set(drawn.card.id, play.revealImage?.(drawn))
    titleById.current.set(drawn.card.id, drawn.reveal.title)
    artistById.current.set(drawn.card.id, drawn.reveal.subtitle)
  }

  // Optimistically show the playing state, but undo it if the provider rejects
  // (device gone, 404) so the card never shows a spinning disc / pause icon
  // while nothing is actually playing.
  function startAudio(drawn: DrawnCard) {
    setPlaying(true)
    Promise.resolve(play.audio?.onDraw(drawn)).catch((e) => {
      setError(String(e))
      setPlaying(false)
    })
  }

  async function drawNext() {
    const drawn = deck.current ? await deck.current.next() : null
    record(drawn)
    return drawn
  }

  async function start(s: GameSetupResult) {
    setError(null)
    try {
      deck.current = await play.initDeck(s, Math.random)
      const anchors: Card[] = []
      for (let i = 0; i < s.names.length; i++) {
        const drawn = await drawNext()
        if (!drawn) throw new Error('Not enough cards to start.')
        anchors.push(drawn.card)
      }
      const first = await drawNext()
      if (!first) throw new Error('Not enough cards to start.')
      dispatch({
        type: 'start',
        state: startGame(
          { targetCards: s.targetCards },
          s.names.map((name, i) => ({ id: `p${i}`, name })),
          anchors,
          first,
        ),
      })
      startAudio(first)
    } catch (e) {
      setError(String(e))
    }
  }

  // The reveal's OK button starts the turn-end choreography:
  // show the placed card in the deck -> pile -> "next player" cover (swap behind
  // it) -> deal the next player's hand. If the turn won, go to the win screen.
  function beginEndTurn() {
    if (!state || endingStarted.current) return
    endingStarted.current = true
    const cur = state
    const player = cur.players[cur.currentPlayerIndex]
    const won = player.timeline.length >= cur.config.targetCards
    setEnding(true) // hides the reveal; the hand shows the placed card
    if (won) {
      schedule(() => {
        Promise.resolve(play.audio?.onStop()).catch(() => {})
        dispatch({ type: 'advance', nextDrawn: null }) // -> won -> WinScreen
        setEnding(false)
      }, 1100)
      return
    }
    schedule(() => {
      const nextIdx = (cur.currentPlayerIndex + 1) % cur.players.length
      setNextName(cur.players[nextIdx].name)
      setPiled(true) // collapse the hand into a pile
      schedule(() => setSwitching(true), 600) // then cover for the swap
    }, 1100)
  }

  async function switchCovered() {
    const nextDrawn = await drawNext()
    dispatch({ type: 'advance', nextDrawn })
    if (nextDrawn) startAudio(nextDrawn)
  }
  function switchDone() {
    setSwitching(false)
    setPiled(false) // deal: the next player's pile spreads into their hand
    setEnding(false)
    endingStarted.current = false // ready for the next turn's reveal
  }

  // Start the game once, from the setup handed in by the menu.
  useEffect(() => {
    if (started.current) return
    started.current = true
    start(setupResult)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state)
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg, #08060f)',
          color: 'var(--accent, #9a6bff)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          letterSpacing: '0.3em',
          fontSize: 14,
          textTransform: 'uppercase',
          padding: 24,
          textAlign: 'center',
        }}
      >
        {error ?? 'Dealing the deck...'}
      </div>
    )

  if (isWon(state))
    return (
      <WinScreen state={state} onPlayAgain={() => window.location.reload()} />
    )

  return (
    <>
      {error && <p className="reveal-err">{error}</p>}
      <GameScreen
        state={state}
        Mystery={play.Mystery}
        titleOf={titleOf}
        artistOf={artistOf}
        imageOf={imageOf}
        piled={piled}
        interactive={!ending && !switching}
        playing={playing}
        onPlace={(slot) => dispatch({ type: 'place', slotIndex: slot })}
        onPause={() => {
          Promise.resolve(play.audio?.onPause()).catch(() => {})
          setPlaying(false)
        }}
        onResume={() => {
          Promise.resolve(play.audio?.onResume()).catch((e) =>
            setError(String(e)),
          )
          setPlaying(true)
        }}
        onReplay={() => {
          if (state.drawn) {
            Promise.resolve(play.audio?.onReplay(state.drawn)).catch((e) => {
              setError(String(e))
              setPlaying(false)
            })
            setPlaying(true)
          }
        }}
      />
      {state.phase === 'revealed' && !ending && (
        <RevealOverlay
          state={state}
          image={state.drawn ? play.revealImage?.(state.drawn) : undefined}
          onNext={beginEndTurn}
        />
      )}
      {switching && (
        <TurnSwitch
          name={nextName}
          onCovered={() => void switchCovered()}
          onDone={switchDone}
        />
      )}
    </>
  )
}
