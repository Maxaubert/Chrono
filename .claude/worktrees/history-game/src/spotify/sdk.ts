// src/spotify/sdk.ts

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js'

/** Inject the Web Playback SDK script and resolve when it is ready. */
export function loadSdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve()
  return new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const tag = document.createElement('script')
    tag.src = SDK_SRC
    tag.async = true
    tag.onerror = () => reject(new Error('Failed to load Spotify SDK'))
    document.body.appendChild(tag)
  })
}

export interface ConnectedPlayer {
  deviceId: string
  player: Spotify.Player
}

/** Create + connect a player, resolving its device id. `spotify` is injectable
 * for tests; in the app it defaults to the global loaded by loadSdk(). */
export function createConnectedPlayer(args: {
  name: string
  getToken: () => string
  spotify?: typeof window.Spotify
}): Promise<ConnectedPlayer> {
  const Spotify = args.spotify ?? window.Spotify
  return new Promise((resolve, reject) => {
    const player = new Spotify.Player({
      name: args.name,
      getOAuthToken: (cb) => cb(args.getToken()),
    })
    player.addListener('ready', ({ device_id }) =>
      resolve({ deviceId: device_id, player }),
    )
    player.addListener('account_error', ({ message }) =>
      reject(new Error(`Spotify Premium required: ${message}`)),
    )
    player.addListener('authentication_error', ({ message }) =>
      reject(new Error(`Spotify auth error: ${message}`)),
    )
    player.connect()
  })
}
