import { BrowserQRCodeReader } from '@zxing/browser'

/** Decodes QR text from a video stream until stopped. */
export interface QrScanner {
  start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void>
  stop(): void
}

/** Real camera scanner backed by ZXing. Verified manually (needs a camera). */
export class CameraQrScanner implements QrScanner {
  private reader = new BrowserQRCodeReader()
  private controls: { stop: () => void } | null = null

  async start(
    video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void> {
    this.controls = await this.reader.decodeFromVideoDevice(
      undefined,
      video,
      (result) => {
        if (result) onDecode(result.getText())
      },
    )
  }

  stop(): void {
    this.controls?.stop()
    this.controls = null
  }
}
