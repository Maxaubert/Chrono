import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerGame, resetRegistry, type GameModule } from '@/games'
import { hitster } from '@/games/hitster'
import { ThemeProvider } from './ThemeProvider'
import { useActiveGame } from './activeGameContext'

const stub: GameModule = {
  id: 'stub',
  name: 'Stub',
  description: '',
  playable: false,
  theme: {
    title: 'Stub',
    tagline: '',
    titleFont: 'serif',
    skinClass: 'skin-stub',
    palette: {
      bg: '#000',
      panel: '#111',
      accent: '#ff0000',
      accent2: '#aa0000',
      glow: 'rgba(255,0,0,.2)',
      ink: '#100',
    },
    FanCard: () => <div />,
  },
}

function Probe() {
  const { game, setGame } = useActiveGame()
  return (
    <button data-testid="sw" onClick={() => setGame('stub')}>
      {game.theme.title}
    </button>
  )
}

beforeEach(() => {
  resetRegistry()
  registerGame(hitster)
  registerGame(stub)
})

test('provides the default game and applies its skin + accent', () => {
  const { container } = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
  const root = container.firstChild as HTMLElement
  expect(root.className).toContain('skin-hitster')
  expect(root.style.getPropertyValue('--accent')).toBe('#9a6bff')
  expect(screen.getByTestId('sw')).toHaveTextContent('Hitster')
})

test('switching the active game swaps skin + palette', async () => {
  const { container } = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
  await userEvent.click(screen.getByTestId('sw'))
  const root = container.firstChild as HTMLElement
  expect(root.className).toContain('skin-stub')
  expect(root.style.getPropertyValue('--accent')).toBe('#ff0000')
  expect(screen.getByTestId('sw')).toHaveTextContent('Stub')
})
