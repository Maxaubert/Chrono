import type { DrawnCard } from '@/core'
import type { SpotifyTrack } from '@/spotify'
import SetupScreen, { type SetupResult } from '../SetupScreen'
import type { SpotifySession } from '../useSpotifySession'
import type { GamePlay, GameSetupProps } from '../play/adapter'
import { makeHitsterDeck } from './deckSource'
import HitsterMystery from './HitsterMystery'

/** Build Hitster's play adapter for a given Spotify session. The session
 *  supplies the deck's year lookup, the audio provider, and the setup wizard. */
export function makeHitsterPlay(session: SpotifySession): GamePlay {
  // The Spotify SetupScreen collects names + target + tracks. We stash the
  // chosen tracks here so initDeck can read them while GameSetupResult stays
  // game-neutral (names + targetCards only).
  let pendingTracks: SpotifyTrack[] = []
  const imageById = new Map<string, string | null>()

  function Setup({ onStart, onClose, onGuest }: GameSetupProps) {
    return (
      <SetupScreen
        session={session}
        onClose={onClose}
        onGuest={onGuest}
        onStart={(r: SetupResult) => {
          pendingTracks = r.tracks
          imageById.clear()
          for (const t of r.tracks) imageById.set(t.id, t.image)
          onStart({ names: r.names, targetCards: r.targetCards })
        }}
      />
    )
  }

  // The card's title/artist are search hints for the iTunes guest provider;
  // URI-based providers ignore them.
  const trackRef = (drawn: DrawnCard) => ({
    uri: `spotify:track:${drawn.card.id}`,
    artist: drawn.reveal.subtitle,
    title: drawn.reveal.title,
  })

  return {
    Setup,
    Mystery: HitsterMystery,
    initDeck: (_result, rng) =>
      makeHitsterDeck(pendingTracks, session.fetchYear, rng),
    revealImage: (drawn) => imageById.get(drawn.card.id) ?? undefined,
    audio: {
      onDraw: (drawn) => session.provider.play(trackRef(drawn)),
      onPause: () => session.provider.pause(),
      onResume: () => session.provider.resume(),
      onReplay: (drawn) => session.provider.play(trackRef(drawn)),
      onStop: () => session.provider.stop(),
    },
  }
}
