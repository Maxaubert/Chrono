# Vercel Deploy — Design

**Date:** 2026-06-05
**Goal:** Put Chrono online at a real HTTPS URL so it can be shared, with the
Spotify playlist scrape working in production (not just the Vite dev server).

## Why this is non-trivial

The playlist import + year lookup run on server-side endpoints that today exist
**only in the Vite dev server**: `vite-plugin-spotify-scraper.ts` serves
`/api/playlist-tracks` and `/api/track-year`. A static `npm run build` (`dist/`)
ships none of them, so a static host (GitHub Pages) loads the app but breaks the
moment you import a playlist. Vercel runs both the static site **and** serverless
functions, so the two endpoints port cleanly.

## Decisions (confirmed)

- **Reuse the existing Spotify app** — add the Vercel callback as a second redirect
  URI; localhost stays for dev.
- **Deploy via Vercel's GitHub integration** — auto-deploy on push to `main`, PR
  preview URLs. The user wires the repo in the Vercel dashboard; we provide config
  - a runbook.

## Architecture

### 1. Shared scraper core — `server/spotifyScraper.ts`

Move the network/orchestration logic out of `vite-plugin-spotify-scraper.ts` into a
framework-agnostic module exporting `scrapeAllTracks(id)` and `getTrackYear(id)`
(plus the private bundle/hash/token helpers). Pure parsing stays in
`src/spotify/pathfinder.ts` (already tested). Uses global `fetch` (present in Node
18+ dev and the Vercel runtime). Module-level bundle/hash caches keep working —
warm function instances reuse them; cold starts re-fetch (same as a dev restart).

### 2. Two thin adapters over the core

- `vite-plugin-spotify-scraper.ts` keeps its middleware but imports + calls the
  shared module — **`npm run dev` behaviour is unchanged**.
- `api/playlist-tracks.ts`, `api/track-year.ts` — Vercel functions
  (`@vercel/node` handler) that read `?id=`, call the shared module, and return the
  **same JSON shapes** (`{tracks,total}` / `{year}`) with the same 400 (missing id)
  / 502 (scrape failure) handling. The client already calls `/api/...`, so **no
  client changes**.

### 3. Routing + build — `vercel.json`

Vercel auto-detects Vite (`npm run build` -> `dist`, serves `api/` as functions).
Add a SPA rewrite so client routes (`/callback`) serve `index.html`, leaving
`/api/*` and static assets untouched:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

### 4. TypeScript wiring

Add `server/**/*.ts` and `api/**/*.ts` to `tsconfig.node.json`'s `include` so
`tsc -b` typechecks them. Add `@vercel/node` as a devDependency for the handler
types (imported `import type`, satisfying `verbatimModuleSyntax`).

### 5. Config (user, in dashboards — runbook in `DEPLOY.md`)

- Vercel env vars (build-time, `VITE_` are inlined at build):
  `VITE_SPOTIFY_CLIENT_ID` = existing id; `VITE_SPOTIFY_REDIRECT_URI` =
  `https://<app>.vercel.app/callback`.
- Spotify dashboard: add `https://<app>.vercel.app/callback` as a redirect URI.
  The localhost->127.0.0.1 hack is inert on `vercel.app`, so no conflict.
- Add host Spotify accounts to the app's allowlist (dev mode, <=25). Guest mode
  needs no login.

## Error handling

Functions mirror the dev middleware: missing `id` -> 400; scrape throw -> 502 with
the error string. The client's existing setup error banner surfaces both.

## Testing / verification

- `lint` + `test` + `build` stay green after the refactor (the shared module is
  covered transitively; pure parsing keeps its unit tests).
- Confirm `npm run dev` still serves both `/api` endpoints (dev parity).
- Optionally `vercel dev` locally to exercise the functions.
- Real production scraping is only verifiable post-deploy (live Spotify).

## Known risk (documented, not solved)

Serverless functions run from datacenter IPs, which Spotify rate-limits harder than
a home machine, so the scrape may be occasionally flaky in prod. Durable fix
(proper backend / curated static decks / Extended Quota) is out of scope here.

## Out of scope

The hosted "equivalent player" (Hitster-style routed player) and any new playback
path — separate follow-up once the app is live.
