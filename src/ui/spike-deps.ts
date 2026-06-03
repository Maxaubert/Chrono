import { MockProvider, type AudioProvider } from '@/audio'
import { CameraQrScanner, MockScanner, type QrScanner } from '@/scan'
import { SpotifyProvider, loadTokens } from '@/spotify'

export interface SpikeDeps {
  mock: boolean
  provider: AudioProvider
  scanner: QrScanner
}

export function createSpikeDeps(search: string): SpikeDeps {
  const isMock = new URLSearchParams(search).get('mock') === '1'
  if (isMock) {
    return {
      mock: true,
      provider: new MockProvider(),
      scanner: new MockScanner(),
    }
  }
  return {
    mock: false,
    provider: new SpotifyProvider({
      getAccessToken: () => loadTokens()?.accessToken ?? null,
    }),
    scanner: new CameraQrScanner(),
  }
}
