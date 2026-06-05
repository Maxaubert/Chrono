// Drives the game-screen visualizer from Spotify's precomputed audio analysis.
// The Web Playback SDK audio is DRM-protected and cannot be tapped with a Web
// Audio AnalyserNode, so we read the track's loudness/pitch envelope instead and
// sample it at the current playback position.
//
// NOTE: Spotify deprecated /audio-analysis for apps without prior access
// (Nov 2024); fetchAudioAnalysis returns null on any failure so the caller falls
// back to the decorative animation.

const API = 'https://api.spotify.com/v1'

interface RawSegment {
  start: number
  duration: number
  loudness_max: number // dB (negative)
  pitches: number[] // 12 chroma values, 0..1
}
interface RawAnalysis {
  track?: { duration?: number }
  segments?: RawSegment[]
}

export interface Spectrum {
  /** Track length in seconds. */
  duration: number
  /** `bands` bar levels (each 0..1) for the segment playing at `posSec`. */
  levelsAt(posSec: number, bands: number): number[]
}

/** Build a Spectrum from a parsed audio-analysis object. Pure and testable. */
export function buildSpectrum(a: RawAnalysis): Spectrum {
  const segs = (a.segments ?? []).filter(
    (s) => Array.isArray(s.pitches) && s.pitches.length > 0,
  )
  const last = segs[segs.length - 1]
  const duration = a.track?.duration ?? (last ? last.start + last.duration : 0)

  const louds = segs.map((s) => s.loudness_max)
  const lo = louds.length ? Math.min(...louds) : -60
  const hi = louds.length ? Math.max(...louds) : 0
  const norm = (db: number) => (hi === lo ? 0.6 : (db - lo) / (hi - lo))

  function segAt(pos: number): RawSegment | null {
    if (!segs.length) return null
    let loI = 0
    let hiI = segs.length - 1
    while (loI < hiI) {
      const mid = (loI + hiI + 1) >> 1
      if (segs[mid].start <= pos) loI = mid
      else hiI = mid - 1
    }
    return segs[loI]
  }

  return {
    duration,
    levelsAt(pos, bands) {
      const s = segAt(pos)
      if (!s) return new Array(bands).fill(0.12)
      const energy = 0.15 + 0.85 * norm(s.loudness_max) // overall loudness
      const p = s.pitches
      const out = new Array<number>(bands)
      for (let i = 0; i < bands; i++) {
        // resample the 12 chroma bins up to `bands`
        const f = (i / Math.max(1, bands - 1)) * (p.length - 1)
        const a0 = Math.floor(f)
        const a1 = Math.min(p.length - 1, a0 + 1)
        const t = f - a0
        const chroma = p[a0] * (1 - t) + p[a1] * t
        // gentle arch so the middle reads a touch taller
        const env = 0.7 + 0.3 * Math.sin((Math.PI * i) / Math.max(1, bands - 1))
        out[i] = Math.max(0.06, Math.min(1, chroma * energy * env))
      }
      return out
    },
  }
}

/** Fetch + build a Spectrum for a track. Returns null on any failure (caller
 *  falls back to the decorative loop). */
export async function fetchAudioAnalysis(
  trackId: string,
  token: string,
): Promise<Spectrum | null> {
  try {
    const res = await fetch(`${API}/audio-analysis/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const json = (await res.json()) as RawAnalysis
    if (!json.segments?.length) return null
    return buildSpectrum(json)
  } catch {
    return null
  }
}
