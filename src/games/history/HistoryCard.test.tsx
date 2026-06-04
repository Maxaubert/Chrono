import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FanCard, SAMPLE_EVENTS } from './HistoryCard'
import { history } from './index'

test('FanCard renders the event year', () => {
  render(<FanCard index={0} />)
  expect(screen.getAllByText(SAMPLE_EVENTS[0].year).length).toBeGreaterThan(0)
})

test('history is a non-playable game with its own natural theme', () => {
  expect(history.theme.title).toBe('History')
  expect(history.playable).toBe(false)
  expect(history.theme.skinClass).toBe('skin-history')
  expect(history.theme.palette.accent).toBe('#cda349')
})
