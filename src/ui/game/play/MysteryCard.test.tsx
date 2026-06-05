import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MysteryCard from './MysteryCard'

test('while playing, the controls are replay + pause', async () => {
  const onReplay = vi.fn()
  const onPause = vi.fn()
  const onResume = vi.fn()
  render(
    <MysteryCard
      onReplay={onReplay}
      onPause={onPause}
      onResume={onResume}
      isPlaying
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Replay' }))
  await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
  expect(onReplay).toHaveBeenCalledOnce()
  expect(onPause).toHaveBeenCalledOnce()
  expect(onResume).not.toHaveBeenCalled()
})

test('in QR mode, shows a scan-to-play QR and no transport controls', async () => {
  render(
    <MysteryCard
      qr
      trackId="3n3Ppam7vgaVa1iaRUc9Lp"
      onReplay={vi.fn()}
      onPause={vi.fn()}
      onResume={vi.fn()}
    />,
  )
  // the QR image resolves asynchronously from the track's open.spotify.com link
  expect(await screen.findByAltText(/scan to play/i)).toBeInTheDocument()
  expect(screen.getByText(/scan to play/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Replay' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Play' })).toBeNull()
})

test('while paused, the toggle becomes Play and resumes', async () => {
  const onPause = vi.fn()
  const onResume = vi.fn()
  render(
    <MysteryCard
      onReplay={vi.fn()}
      onPause={onPause}
      onResume={onResume}
      isPlaying={false}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Play' }))
  expect(onResume).toHaveBeenCalledOnce()
  expect(onPause).not.toHaveBeenCalled()
})
