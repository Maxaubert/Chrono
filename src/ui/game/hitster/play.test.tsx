import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { registerGame, resetRegistry } from '@/games'
import { hitster } from '@/games/hitster'
import type { AudioProvider } from '@/audio'
import { ThemeProvider } from '@/ui/theme/ThemeProvider'
import { SpotifySessionProvider } from '../spotifySessionContext'
import type { SpotifySession } from '../useSpotifySession'
import { makeHitsterPlay } from './play'

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
})

const silentProvider: AudioProvider = {
  id: 'test',
  play: async () => {},
  pause: async () => {},
  resume: async () => {},
  stop: async () => {},
}

function fakeSession(overrides: Partial<SpotifySession> = {}): SpotifySession {
  return {
    mock: false,
    guest: true, // guest skips the login gate straight into the players step
    loggedIn: false,
    connected: false,
    error: null,
    provider: silentProvider,
    login: async () => {},
    logout: () => {},
    connect: async () => {},
    importPlaylistId: async () => [],
    loadMyPlaylists: async () => [],
    fetchYear: async () => null,
    ...overrides,
  }
}

function wrap(session: SpotifySession, children: ReactNode) {
  return (
    <ThemeProvider>
      <SpotifySessionProvider value={session}>
        {children}
      </SpotifySessionProvider>
    </ThemeProvider>
  )
}

test('Setup keeps a stable component identity across adapter rebuilds', () => {
  // A new identity per rebuild is what made React remount the wizard and wipe
  // its state whenever the session changed mid-setup.
  expect(makeHitsterPlay(fakeSession()).Setup).toBe(
    makeHitsterPlay(fakeSession({ connected: true })).Setup,
  )
})

test('typed wizard state survives a session update (no remount)', async () => {
  const s1 = fakeSession()
  const play1 = makeHitsterPlay(s1)
  const { rerender } = render(wrap(s1, <play1.Setup onStart={() => {}} />))

  await userEvent.type(screen.getByTestId('name-0'), 'Alice')
  expect(screen.getByTestId('name-0')).toHaveValue('Alice')

  // The SDK auto-connect finishing (or a delayed error) produces a fresh
  // session object and, in the shell, a rebuilt adapter. The wizard must keep
  // everything the host typed.
  const s2 = fakeSession({ connected: true })
  const play2 = makeHitsterPlay(s2)
  rerender(wrap(s2, <play2.Setup onStart={() => {}} />))

  expect(screen.getByTestId('name-0')).toHaveValue('Alice')
})
