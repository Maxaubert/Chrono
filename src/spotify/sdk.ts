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

/** How long to wait for the player to report "ready" before giving up, so a
 * device that never initializes (e.g. no EME/DRM support) fails loudly instead
 * of hanging the setup screen forever. */
const READY_TIMEOUT_MS = 15000

/** Create + connect a player, resolving its device id. `spotify` is injectable
 * for tests; in the app it defaults to the global loaded by loadSdk(). Rejects
 * (rather than hanging) on every failure mode: not Premium, auth, playback
 * init failure, a failed connect(), or a timeout with no events at all. */
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
    let settled = false
    const timer = setTimeout(
      () =>
        fail(
          'Spotify player never became ready. This browser may not support ' +
            'in-browser playback (DRM/EME), or it is blocked by an extension.',
        ),
      READY_TIMEOUT_MS,
    )
    function done() {
      settled = true
      clearTimeout(timer)
    }
    function ok(cp: ConnectedPlayer) {
      if (settled) return
      done()
      resolve(cp)
    }
    function fail(message: string) {
      if (settled) return
      done()
      reject(new Error(message))
    }

    player.addListener('ready', ({ device_id }) =>
      ok({ deviceId: device_id, player }),
    )
    player.addListener('account_error', ({ message }) =>
      fail(`Spotify Premium required: ${message}`),
    )
    player.addListener('authentication_error', ({ message }) =>
      fail(`Spotify auth error: ${message}`),
    )
    player.addListener('initialization_error', ({ message }) =>
      fail(`Spotify could not start playback: ${message}`),
    )
    player.addListener('playback_error', ({ message }) =>
      fail(`Spotify playback error: ${message}`),
    )
    player.connect().then((connected) => {
      if (!connected) fail('Spotify player failed to connect.')
    })
  })
}
