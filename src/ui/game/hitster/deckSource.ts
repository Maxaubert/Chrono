import type { SpotifyTrack } from '@/spotify'
import { buildDeck, takeNextDrawn } from '../deck'
import type { DeckHandle } from '../play/adapter'

/** A DeckHandle over a shuffled Spotify track list. Pops the next track whose
 *  release year resolves, mapping it to a DrawnCard (the existing behavior,
 *  just lifted out of GameContainer). Pass a null rng to keep the input order
 *  (mock mode: the E2E relies on a deterministic draw order). */
export function makeHitsterDeck(
  tracks: SpotifyTrack[],
  fetchYear: (id: string) => Promise<number | null>,
  rng: (() => number) | null,
): DeckHandle {
  let remaining = rng ? buildDeck(tracks, rng) : tracks.slice()
  return {
    async next() {
      const res = await takeNextDrawn(remaining, fetchYear)
      remaining = res.remaining
      return res.drawn
    },
  }
}
