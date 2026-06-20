import type { QrScanner } from './scanner'

/** In-memory scanner for tests/E2E. `emit` simulates reading a QR. */
export class MockScanner implements QrScanner {
  private onDecode: ((text: string) => void) | null = null

  async start(
    _video: HTMLVideoElement,
    onDecode: (text: string) => void,
  ): Promise<void> {
    this.onDecode = onDecode
  }

  emit(text: string): void {
    this.onDecode?.(text)
  }

  stop(): void {
    this.onDecode = null
  }
}
