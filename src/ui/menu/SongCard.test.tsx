import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardBack, CardFront, SAMPLE_DECK } from './SongCard'

test('CardFront shows the year, title and artist', () => {
  const song = SAMPLE_DECK[0]
  render(<CardFront song={song} />)
  expect(screen.getAllByText(song.year).length).toBeGreaterThan(0)
  expect(screen.getByText(song.title)).toBeInTheDocument()
  expect(screen.getByText(song.artist)).toBeInTheDocument()
})

test('CardBack shows the guess prompt', () => {
  render(<CardBack />)
  expect(screen.getByText('GUESS THE YEAR')).toBeInTheDocument()
})
