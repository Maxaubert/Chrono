# Chrono

A web platform for **timeline-guessing card games**. Hear or read a card, place
it on your timeline by year, and build the longest correct timeline. Hitster
(music) and a History game are the first two games on a shared engine.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command            | What it does                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start the Vite dev server          |
| `npm run build`    | Typecheck and build for production |
| `npm run preview`  | Preview the production build       |
| `npm run test`     | Run unit tests (Vitest)            |
| `npm run test:e2e` | Run end-to-end tests (Playwright)  |
| `npm run lint`     | Lint with ESLint                   |
| `npm run format`   | Format with Prettier               |

## Structure

```
src/
  core/    pure timeline/turn/scoring engine (no React, no Spotify)
  games/   pluggable game modules + registry (hitster, ...)
  audio/   AudioProvider interface + mock
  ui/      React UI shell (Tailwind)
e2e/       Playwright tests
```

## Status

Phase 0 (project setup) is complete. See [`roadmap.md`](./roadmap.md) for what
comes next.

## Spotify (Phase 1)

Music playback will use the Spotify Web Playback SDK (full tracks in-browser,
Premium required, host-only login). Copy `.env.example` to `.env` and add your
Spotify app's client ID. No client secret is needed (PKCE flow).
