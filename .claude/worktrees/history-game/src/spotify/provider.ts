// src/spotify/provider.ts
import type { AudioProvider, AudioTrackRef } from '@/audio'
import { createConnectedPlayer, loadSdk } from './sdk'

const API = 'https://api.spotify.com/v1'

export class SpotifyProvider implements AudioProvider {
  readonly id = 'spotify'
  private deviceId: string | null
  private readonly getAccessToken: () => string | null
  private readonly fetchImpl: typeof fetch

  constructor(opts: {
    getAccessToken: () => string | null
    deviceId?: string | null
    fetchImpl?: typeof fetch
  }) {
    this.getAccessToken = opts.getAccessToken
    this.deviceId = opts.deviceId ?? null
    // Bind to globalThis: native fetch throws "Illegal invocation" when called
    // as a method of any other object (e.g. this.fetchImpl(...)).
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis)
  }

  /** Load the SDK and connect a player; stores the resulting device id. */
  async connect(): Promise<void> {
    await loadSdk()
    const { deviceId } = await createConnectedPlayer({
      name: 'Chrono',
      getToken: () => this.getAccessToken() ?? '',
    })
    this.deviceId = deviceId
  }

  get isConnected(): boolean {
    return this.deviceId !== null
  }

  private async put(path: string, body?: unknown): Promise<void> {
    if (!this.deviceId)
      throw new Error('Player not connected; call connect() first.')
    const token = this.getAccessToken()
    if (!token) throw new Error('Not authenticated.')
    const res = await this.fetchImpl(
      `${API}${path}?device_id=${this.deviceId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    )
    if (!res.ok) throw new Error(`Playback request failed: ${res.status}`)
  }

  async play(track: AudioTrackRef): Promise<void> {
    await this.put('/me/player/play', { uris: [track.uri] })
  }

  async pause(): Promise<void> {
    await this.put('/me/player/pause')
  }

  /** Resume current playback (no uris = continue from the paused position). */
  async resume(): Promise<void> {
    await this.put('/me/player/play')
  }

  async stop(): Promise<void> {
    await this.put('/me/player/pause')
  }
}
