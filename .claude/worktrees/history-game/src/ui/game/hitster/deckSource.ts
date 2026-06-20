import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from '../deck'
import type { DeckHandle } from '../play/adapter'

/** A DeckHandle over a shuffled Spotify track list. Pops the next track whose
 *  release year resolves, mapping it to a DrawnCard (the existing behavior,
 *  just lifted out of GameContainer). */
export function makeHitsterDeck(
  tracks: SpotifyTrack[],
  fetchYear: (id: string) => Promise<number | null>,
  rng: () => number,
): DeckHandle {
  let remaining = buildDeck(tracks, rng)
  return {
    async next() {
      const res = await takeNextDrawn(remaining, fetchYear)
      remaining = res.remaining
      return res.drawn
    },
  }
}
