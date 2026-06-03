import { listGames } from '@/games'

export default function App() {
  const games = listGames()

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-4xl font-bold tracking-tight">Chrono</h1>
      <p className="mt-2 text-neutral-500">
        Timeline-guessing card games. Pick a game to start.
      </p>

      <ul className="mt-8 grid gap-4">
        {games.map((game) => (
          <li
            key={game.id}
            className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <h2 className="text-xl font-semibold">{game.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{game.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
