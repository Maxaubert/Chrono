import type { DrawnCard } from '@/core'
import type { SpotifyTrack } from '@/spotify'

/** Fisher-Yates shuffle into a new array using an injected rng (0..1). */
export function buildDeck(
  tracks: SpotifyTrack[],
  rng: () => number,
): SpotifyTrack[] {
  const out = tracks.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Pop tracks until one yields a year, returning its DrawnCard + the rest.
 *  Only a track the lookup positively reports as year-less is skipped; a
 *  FAILED lookup (network, rate limit -- fetchYear throws) propagates without
 *  consuming the track, so a transient outage cannot silently burn the deck. */
export async function takeNextDrawn(
  remaining: SpotifyTrack[],
  fetchYear: (id: string) => Promise<number | null>,
): Promise<{ drawn: DrawnCard | null; remaining: SpotifyTrack[] }> {
  const rest = remaining.slice()
  while (rest.length > 0) {
    const track = rest[0]
    const year = await fetchYear(track.id) // throws -> track stays in `remaining`
    rest.shift()
    if (year != null) {
      return {
        drawn: {
          card: { id: track.id, year },
          reveal: { title: track.title, subtitle: track.artist, year },
        },
        remaining: rest,
      }
    }
  }
  return { drawn: null, remaining: [] }
}
