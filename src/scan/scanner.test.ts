import { expect, test, vi } from 'vitest'
import { CameraQrScanner, type QrReader } from './scanner'

test('stop() during a pending start() still stops the camera', async () => {
  const stop = vi.fn()
  let release: (v: unknown) => void = () => {}
  const gate = new Promise((r) => (release = r))
  const reader: QrReader = {
    // simulates the getUserMedia/permission wait
    decodeFromVideoDevice: vi.fn(async () => {
      await gate
      return { stop }
    }),
  }
  const scanner = new CameraQrScanner(reader)

  const pending = scanner.start(
    {} as HTMLVideoElement,
    () => {},
  )
  scanner.stop() // user clicks Stop (or unmounts) before granting permission
  release(undefined)
  await pending

  // the late-arriving controls must be stopped, not leaked with a live camera
  expect(stop).toHaveBeenCalled()
})

test('a normal start/stop cycle stops via the stored controls', async () => {
  const stop = vi.fn()
  const reader: QrReader = {
    decodeFromVideoDevice: vi.fn(async () => ({ stop })),
  }
  const scanner = new CameraQrScanner(reader)
  await scanner.start({} as HTMLVideoElement, () => {})
  scanner.stop()
  expect(stop).toHaveBeenCalledTimes(1)
})
