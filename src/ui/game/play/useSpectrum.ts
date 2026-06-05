import { useEffect, useRef, type RefObject } from 'react'
import { loadTokens } from '@/spotify'
import { fetchAudioAnalysis, type Spectrum } from '@/spotify/audioAnalysis'

/**
 * Drives a row of bar elements from a track's Spotify audio analysis, sampled at
 * the current playback position. When no analysis is available (mock, not logged
 * in, or the endpoint is unavailable) it leaves the bars alone so the caller's
 * decorative CSS animation stays. Position is estimated from play/replay/pause.
 */
export function useSpectrum({
  trackId,
  isPlaying,
  playEpoch,
  enabled,
  containerRef,
}: {
  trackId: string | undefined
  isPlaying: boolean
  playEpoch: number
  enabled: boolean
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const specRef = useRef<Spectrum | null>(null)
  const smoothRef = useRef<number[]>([])
  // playback clock: base seconds already elapsed, plus time since startedAt while playing
  const clock = useRef({ base: 0, startedAt: 0, playing: false })

  // Fetch analysis when the track changes.
  useEffect(() => {
    specRef.current = null
    if (!enabled || !trackId) return
    const token = loadTokens()?.accessToken
    if (!token) return
    let cancelled = false
    void fetchAudioAnalysis(trackId, token).then((s) => {
      if (!cancelled) specRef.current = s
    })
    return () => {
      cancelled = true
    }
  }, [trackId, enabled])

  // Reset the clock whenever playback (re)starts.
  useEffect(() => {
    clock.current = { base: 0, startedAt: performance.now(), playing: true }
  }, [playEpoch])

  // Pause/resume the clock with playback.
  useEffect(() => {
    const c = clock.current
    if (isPlaying && !c.playing) {
      c.startedAt = performance.now()
      c.playing = true
    } else if (!isPlaying && c.playing) {
      c.base += (performance.now() - c.startedAt) / 1000
      c.playing = false
    }
  }, [isPlaying])

  // rAF loop: sample the spectrum and write smoothed bar heights.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = containerRef.current
      const spec = specRef.current
      if (!el) return
      if (!spec) {
        el.classList.remove('live')
        return
      }
      el.classList.add('live')
      const c = clock.current
      const pos =
        c.base + (c.playing ? (performance.now() - c.startedAt) / 1000 : 0)
      const bars = el.children
      const levels = spec.levelsAt(pos, bars.length)
      const cur = smoothRef.current
      for (let i = 0; i < bars.length; i++) {
        const prev = cur[i] ?? 0.1
        const next = prev + (levels[i] - prev) * 0.35
        cur[i] = next
        ;(bars[i] as HTMLElement).style.transform = `scaleY(${next.toFixed(3)})`
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [containerRef])
}
