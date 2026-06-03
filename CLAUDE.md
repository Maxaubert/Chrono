# Chrono — for Claude

Chrono is a **web platform for timeline-guessing card games**. Players hear or
read a card and place it on a timeline relative to cards they already hold; a
correct placement keeps the card; first to N cards wins. Hitster (music) and a
History game are the first two of an open-ended set. It is a **single Vite app
with pluggable game modules**, not a monorepo.

First build target: **single-device, local pass-and-play** (one host opens the
site, enters the player count, the app tracks each player's timeline as they take
turns). Online multiplayer rooms come later. See `roadmap.md` for phases.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — typecheck + production build
- `npm run test` — Vitest unit tests (run once); `npm run test:watch` to watch
- `npm run test:e2e` — Playwright E2E (auto-starts the dev server)
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Architecture (keep these boundaries)

- `src/core/` — pure, framework-agnostic engine (timeline placement, turns,
  scoring). **No React, no Spotify, no DOM.** Enforced by
  `.claude/rules/core-purity.md`. Portable to a future native build.
- `src/games/` — pluggable game modules + a registry. New games register
  themselves; the shell/engine stay game-agnostic. `registerBuiltInGames()` runs
  at startup in `src/main.tsx`.
- `src/audio/` — `AudioProvider` interface. `MockProvider` for tests; a Spotify
  Web Playback SDK provider lands in Phase 1.
- `src/ui/` — React UI shell (Tailwind v4).
- `@/` is an import alias for `src/`.

## Stack

React 19 + Vite + TypeScript, Tailwind v4 (`@tailwindcss/vite`), Vitest (+ jsdom,
Testing Library), Playwright, ESLint + Prettier.

## Conventions

- **TDD for `src/core/` logic** — write the failing test first.
- Verify before claiming done: `lint` + `test` + `build` (+ `test:e2e` for UI).
- **No em-dashes** anywhere. Use en-dashes, commas, or rephrase.
- Track feature/fix work as **GitHub issues**, land via **PRs** on a branch.
  Exception: README-only changes commit directly.

## Spotify (Phase 1)

Playback uses the **Web Playback SDK** (full tracks in-browser, no app switch).
Browser-only and **Premium-only**; only the host logs in (PKCE, no client
secret). Config via env (see `.env.example`): `VITE_SPOTIFY_CLIENT_ID`,
`VITE_SPOTIFY_REDIRECT_URI`.

## Gotchas

- Spotify album `release_date` is sometimes a reissue/remaster year, not the
  original release — wrong for a year game. Allow a manual override; a MusicBrainz
  cross-check is a later refinement.
- The Web Playback SDK does not work in mobile webviews; a native port must swap
  the audio provider. That is why playback is behind an interface.
