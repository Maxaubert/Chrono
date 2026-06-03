# Chrono — Roadmap

Chrono is a platform for **timeline-guessing card games**. One shared engine
(place a card on your timeline by year; correct placement keeps it; first to N
wins) powers many games. Hitster (music) and History are the first two.

## Architecture

A single Vite app with **pluggable game modules**, built around three boundaries:

1. **Pure core** (`src/core/`) — the timeline/turn/scoring engine. Framework-
   agnostic TypeScript, portable to a future native build.
2. **Game modules + registry** (`src/games/`) — each game supplies its deck,
   reveal data, and audio source. Adding a game is dropping in a module.
3. **Audio-provider interface** (`src/audio/`) — playback is swappable: a Spotify
   Web Playback SDK provider, a login-free clip provider, a QR/hosted player, or a
   mock for tests.

## Phases

### Phase 0 — Setup ✅

Vite + React + TS app; Tailwind, Vitest, Playwright, ESLint/Prettier; the
`core / games / audio / ui` layout and game registry; project conventions
(`CLAUDE.md`, permission allowlist, format-on-edit hook, core-purity rule,
run-app skill); day-one verification loop (lint + unit + E2E).

### Phase 1 — Hitster, single-device, Connected mode

One host (Spotify Premium) logs in via PKCE; pick from their playlists or paste a
playlist URL; fetch tracks + release years. Timeline-placement engine with
turns/rounds (one player per round, pass-and-play), first-to-N win, optional
artist/title bonus. Songs play in-page via the Web Playback SDK with the identity
hidden, then a reveal. Mock-provider Playwright E2E. Handle release-year accuracy
(allow manual override).

### Phase 2 — History timeline game

A second game module reusing the engine + shell, backed by a curated static fact
dataset. No Spotify. Proves the multi-game abstraction. _(Next priority after
Phase 1.)_

### Phase 3 — QR / Scan mode + optional printable deck

A hosted metadata-stripped player page (the approach official Hitster uses): QR
codes point to our player, never raw Spotify links (those reveal the title and
shuffle on free accounts). Full-track (Premium) or login-free 30s-clip variant,
plus optional duplex printable card sheets.

### Phase 4 — Online multiplayer rooms

Backend, rooms, per-device join, live shared-timeline sync so each player sees
their own timeline on their own device.

### Phase 5 (optional) — Native iOS/Android

Reuse the pure core; Capacitor wrap or React Native; swap audio to the native
Spotify SDK (the Web Playback SDK is browser-only).
