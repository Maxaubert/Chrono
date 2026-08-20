import type { AudioProvider, AudioTrackRef } from './types'

interface ItunesSearch {
  results?: { previewUrl?: string }[]
}

/**
 * Login-free guest playback: looks the track up on the public iTunes Search API
 * by artist + title and plays its 30-second preview clip in an <audio> element.
 * No Spotify, no Premium, no cap, no app handoff -- and the title stays hidden in
 * the UI. Best-effort by design: an unmatched track, a fetch failure (iTunes
 * rate-limits), or a blocked autoplay all resolve to silence rather than throwing.
 */
export class ItunesPreviewProvider implements AudioProvider {
  readonly id = 'itunes'
  private audio: HTMLAudioElement | null
  private readonly fetchImpl: typeof fetch
  // Generation counter: a play()/stop() invalidates any lookup still in flight,
  // so a slow iTunes response cannot start a stale track over the current one.
  private playSeq = 0

  constructor(opts?: { audio?: HTMLAudioElement; fetchImpl?: typeof fetch }) {
    this.audio = opts?.audio ?? null
    // Bind to globalThis so native fetch is not called as a method of `this`.
    this.fetchImpl = opts?.fetchImpl ?? fetch.bind(globalThis)
  }

  private el(): HTMLAudioElement {
    if (!this.audio) this.audio = new Audio()
    return this.audio
  }

  async play(track: AudioTrackRef): Promise<void> {
    const seq = ++this.playSeq
    const url = await this.lookupPreview(track)
    if (seq !== this.playSeq) return // superseded by a newer play()/stop()
    const el = this.el()
    if (!url) {
      // Removing src does not stop an element that is already playing, so an
      // unmatched track must pause explicitly or the previous song leaks on.
      el.pause()
      el.removeAttribute('src')
      return
    }
    el.src = url
    el.currentTime = 0
    try {
      await el.play()
    } catch {
      // autoplay policy or an unplayable preview -> stay silent
    }
  }

  async pause(): Promise<void> {
    this.audio?.pause()
  }

  async resume(): Promise<void> {
    try {
      await this.audio?.play()
    } catch {
      // ignore
    }
  }

  async stop(): Promise<void> {
    this.playSeq++ // cancel any lookup still in flight
    if (!this.audio) return
    this.audio.pause()
    this.audio.removeAttribute('src')
  }

  private async lookupPreview(track: AudioTrackRef): Promise<string | null> {
    const term = [track.artist, track.title].filter(Boolean).join(' ').trim()
    if (!term) return null
    try {
      const res = await this.fetchImpl(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`,
      )
      if (!res.ok) return null
      const data = (await res.json()) as ItunesSearch
      return data.results?.[0]?.previewUrl ?? null
    } catch {
      return null
    }
  }
}
