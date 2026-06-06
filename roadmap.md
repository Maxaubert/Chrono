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

## Ideas (backlog)

Unplanned, unprioritised game concepts. The engine is really an "order a card on
a numeric scale" engine: year is just one axis, so anything with a sortable
number is a candidate. These are ideas, not commitments.

### History as an umbrella (swappable fact packs)

History need not be one game. The same module can ship themed packs the host
picks from:

- World events, Leaders & rulers, Wars & battles, Inventions & tech,
  Space & science, Sports moments, Disasters, Art & architecture.
- Era or difficulty packs (Ancient world, 20th century, etc.).

### Other true-timeline games (year axis)

Same "place by year" mechanic, different deck and reveal art:

- **Cinema** — films by release year (posters).
- **Video games** — release year (box art).
- **Tech & gadgets** — devices by release year.
- **Internet & memes** — when it went viral (sleeper hit; very shareable).
- **Brands & logos** — founding / logo year.
- **Books** — publication year.

### Scale mode (non-time axis, "bigger / smaller")

Same engine, the axis is any quantity instead of a year:

- **Bigger country** — population or area.
- **Taller / longer** — mountains, buildings, rivers.
- **Price is right** — products by price.
- **More famous** — followers, searches.
- **Box office / streams** — gross, streams, views.
- **Animal kingdom** — speed, weight, lifespan, size.
- **Too hot** — Scoville scale.
- **Calorie count** — foods by calories.

### Wildcards

- **What came first** — two-card duels (lightweight variant).
- **Periodic table** — by atomic number.
- **Deep time** — dinosaurs / geologic eras.
- **Slang** — word-usage year.
- **Custom packs** — host-built decks.

### Suggested next builds

1. History-as-packs (extends what already exists).
2. Movies or Memes (new year-axis deck, high appeal).
3. One Scale game (e.g. Bigger country or More famous) to prove the non-time axis.
