/**
 * Recover a track's *original* release year from iTunes Search results, used to
 * correct Spotify's release date when it reports a reissue/remaster year (e.g.
 * "Bohemian Rhapsody" -> Spotify 2018, iTunes earliest 1975). Pure + testable; the
 * network call lives in server/spotifyScraper.ts.
 */

/** A single iTunes Search API "song" result (only the fields we use). */
export interface ItunesSong {
  kind?: string
  trackName?: string
  artistName?: string
  releaseDate?: string
}

/** Lowercase, drop "(...)"/"[...]" version tags, collapse to alphanumerics. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Earliest plausible release year among iTunes results that are the same song by
 * the same primary artist, or null. Different songs and covers by other artists
 * are excluded so a wrong early match can't pull the year back too far.
 */
export function earliestItunesYear(
  results: ItunesSong[],
  query: { artist: string; title: string },
): number | null {
  const wantTitle = norm(query.title)
  const wantArtist = norm(query.artist.split(',')[0]) // primary artist
  if (!wantTitle) return null
  const years = (results ?? [])
    .filter((r) => (r.kind ?? 'song') === 'song')
    .filter((r) => norm(r.trackName ?? '') === wantTitle)
    .filter((r) => !wantArtist || norm(r.artistName ?? '').includes(wantArtist))
    .map((r) => Number((r.releaseDate ?? '').slice(0, 4)))
    .filter((y) => Number.isFinite(y) && y >= 1900 && y <= 2100)
  return years.length ? Math.min(...years) : null
}

/** Reconcile the Spotify year with the iTunes earliest match: the original release
 * is the earliest credible year. */
export function reconcileYear(
  spotify: number | null,
  itunes: number | null,
): number | null {
  if (spotify == null) return itunes
  if (itunes == null) return spotify
  return Math.min(spotify, itunes)
}
