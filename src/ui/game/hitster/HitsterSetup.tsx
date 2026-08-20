import SetupScreen, { type SetupResult } from '../SetupScreen'
import { useSpotifySessionContext } from '../spotifySessionContext'
import type { GameSetupProps } from '../play/adapter'
import { stashPendingDeck } from './pendingDeck'

/**
 * Hitster's setup wizard. Reads the LIVE session from context; closing over
 * the adapter's session snapshot is what used to force an adapter rebuild
 * (new Setup identity -> full remount, wiping every typed name and picked
 * playlist) on every loggedIn/connected/error change.
 */
export default function HitsterSetup({
  onStart,
  onClose,
  onGuest,
}: GameSetupProps) {
  const session = useSpotifySessionContext()
  return (
    <SetupScreen
      session={session}
      onClose={onClose}
      onGuest={onGuest}
      onStart={(r: SetupResult) => {
        stashPendingDeck(r.tracks)
        onStart({ names: r.names, targetCards: r.targetCards })
      }}
    />
  )
}
