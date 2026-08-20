import type { DrawnCard } from '@/core'
import type { SpotifySession } from '../useSpotifySession'
import type { GamePlay } from '../play/adapter'
import { makeHitsterDeck } from './deckSource'
import { pendingImage, pendingTracks } from './pendingDeck'
import HitsterSetup from './HitsterSetup'
import HitsterMystery from './HitsterMystery'

/** Build Hitster's play adapter for a given Spotify session. The session
 *  supplies the deck's year lookup and the audio provider; the setup wizard
 *  reads the live session from context and stashes the chosen tracks in
 *  pendingDeck for initDeck to deal from. */
export function makeHitsterPlay(session: SpotifySession): GamePlay {
  // The card's title/artist are search hints for the iTunes guest provider;
  // URI-based providers ignore them.
  const trackRef = (drawn: DrawnCard) => ({
    uri: `spotify:track:${drawn.card.id}`,
    artist: drawn.reveal.subtitle,
    title: drawn.reveal.title,
  })

  return {
    Setup: HitsterSetup,
    Mystery: HitsterMystery,
    usesSpotify: !session.guest && !session.mock,
    initDeck: (_result, rng) =>
      makeHitsterDeck(pendingTracks(), session.fetchYear, rng),
    revealImage: (drawn) => pendingImage(drawn.card.id),
    audio: {
      onDraw: (drawn) => session.provider.play(trackRef(drawn)),
      onPause: () => session.provider.pause(),
      onResume: () => session.provider.resume(),
      onReplay: (drawn) => session.provider.play(trackRef(drawn)),
      onStop: () => session.provider.stop(),
    },
  }
}
