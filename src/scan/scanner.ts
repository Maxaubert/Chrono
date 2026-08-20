import { BrowserQRCodeReader } from '@zxing/browser'

/** Decodes QR text from a video stream until stopped. */
export interface QrScanner {
  start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void>
  stop(): void
}

/** The slice of BrowserQRCodeReader the scanner uses (injectable for tests). */
export interface QrReader {
  decodeFromVideoDevice(
    deviceId: string | undefined,
    video: HTMLVideoElement,
    callback: (result: { getText(): string } | undefined) => void,
  ): Promise<{ stop: () => void }>
}

/** Real camera scanner backed by ZXing. Verified manually (needs a camera). */
export class CameraQrScanner implements QrScanner {
  private reader: QrReader
  private controls: { stop: () => void } | null = null
  // start() only receives its stop handle after the camera-permission await
  // resolves; a stop() issued during that wait must still win, or the camera
  // (and its in-use indicator) stays on with nothing left to stop it.
  private stopped = false

  constructor(reader?: QrReader) {
    this.reader = reader ?? (new BrowserQRCodeReader() as QrReader)
  }

  async start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void> {
    this.stopped = false
    const controls = await this.reader.decodeFromVideoDevice(
      undefined,
      video,
      (result) => {
        if (result) onDecode(result.getText())
      },
    )
    if (this.stopped) {
      controls.stop() // stop() arrived while we were waiting on the camera
      return
    }
    this.controls = controls
  }

  stop(): void {
    this.stopped = true
    this.controls?.stop()
    this.controls = null
  }
}
