import { expect, test, vi } from 'vitest'
import { ItunesPreviewProvider } from './itunes'

function fakeAudio() {
  return {
    src: '',
    currentTime: 0,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    removeAttribute: vi.fn(),
  } as unknown as HTMLAudioElement & { play: ReturnType<typeof vi.fn> }
}

function fakeFetch(previewUrl?: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: previewUrl ? [{ previewUrl }] : [] }),
  }) as unknown as typeof fetch
}

test('play searches iTunes by artist + title and plays the preview', async () => {
  const audio = fakeAudio()
  const fetchImpl = fakeFetch('https://itunes/preview.m4a')
  const p = new ItunesPreviewProvider({ audio, fetchImpl })

  await p.play({
    uri: 'spotify:track:x',
    artist: 'Daft Punk',
    title: 'Get Lucky',
  })

  const calledUrl = String(
    (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0],
  )
  expect(calledUrl).toContain('itunes.apple.com/search')
  expect(calledUrl).toContain(encodeURIComponent('Daft Punk Get Lucky'))
  expect(audio.src).toBe('https://itunes/preview.m4a')
  expect(audio.play).toHaveBeenCalled()
})

test('no iTunes match stays silent and does not throw', async () => {
  const audio = fakeAudio()
  const p = new ItunesPreviewProvider({
    audio,
    fetchImpl: fakeFetch(undefined),
  })
  await expect(
    p.play({ uri: 'x', artist: 'Nobody', title: 'Nothing' }),
  ).resolves.toBeUndefined()
  expect(
    (audio as unknown as { play: ReturnType<typeof vi.fn> }).play,
  ).not.toHaveBeenCalled()
})

test('a fetch failure fails soft (no throw, no playback)', async () => {
  const audio = fakeAudio()
  const fetchImpl = vi
    .fn()
    .mockRejectedValue(new Error('rate limited')) as unknown as typeof fetch
  const p = new ItunesPreviewProvider({ audio, fetchImpl })
  await expect(
    p.play({ uri: 'x', artist: 'A', title: 'B' }),
  ).resolves.toBeUndefined()
  expect(
    (audio as unknown as { play: ReturnType<typeof vi.fn> }).play,
  ).not.toHaveBeenCalled()
})

test('pause and stop control the audio element', async () => {
  const audio = fakeAudio()
  const p = new ItunesPreviewProvider({ audio })
  await p.pause()
  await p.stop()
  expect(audio.pause).toHaveBeenCalledTimes(2)
})

test('an unmatched lookup pauses the previous preview instead of leaving it playing', async () => {
  const audio = fakeAudio()
  const p = new ItunesPreviewProvider({ audio, fetchImpl: fakeFetch() })

  await p.play({ uri: 'spotify:track:x', artist: 'A', title: 'No Match' })

  expect((audio as unknown as { pause: ReturnType<typeof vi.fn> }).pause)
    .toHaveBeenCalled()
  expect(
    (audio as unknown as { removeAttribute: ReturnType<typeof vi.fn> })
      .removeAttribute,
  ).toHaveBeenCalledWith('src')
  expect(audio.play).not.toHaveBeenCalled()
})

test('a stale slow lookup cannot start over a newer play()', async () => {
  const audio = fakeAudio()
  let resolveSlow: (v: unknown) => void = () => {}
  const slow = new Promise((r) => (resolveSlow = r))
  const fetchImpl = vi
    .fn()
    // first call: hangs until released, resolves to the STALE track
    .mockReturnValueOnce(
      slow.then(() => ({
        ok: true,
        json: async () => ({ results: [{ previewUrl: 'https://stale.m4a' }] }),
      })),
    )
    // second call: resolves immediately to the CURRENT track
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ previewUrl: 'https://current.m4a' }] }),
    }) as unknown as typeof fetch
  const p = new ItunesPreviewProvider({ audio, fetchImpl })

  const first = p.play({ uri: 'u1', artist: 'A', title: 'Old' })
  await p.play({ uri: 'u2', artist: 'B', title: 'New' })
  expect(audio.src).toBe('https://current.m4a')

  resolveSlow(undefined)
  await first
  // the stale lookup resolved after being superseded; it must not win
  expect(audio.src).toBe('https://current.m4a')
})
