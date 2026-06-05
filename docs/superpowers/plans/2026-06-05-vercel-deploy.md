# Vercel Deploy — Implementation Plan

> Executed inline. Spec: docs/superpowers/specs/2026-06-05-vercel-deploy-design.md
> No client changes; the scrape logic is moved, not rewritten.

**Goal:** App live on Vercel with `/api/playlist-tracks` + `/api/track-year`
working as serverless functions; `npm run dev` unchanged.

---

### Task 1: Extract the scraper core to `server/spotifyScraper.ts`

**Files:** Create `server/spotifyScraper.ts`; modify `vite-plugin-spotify-scraper.ts`.

- [ ] Move everything except the Vite `Plugin` wrapper out of
      `vite-plugin-spotify-scraper.ts` into `server/spotifyScraper.ts`: the constants
      (`UA`, `PAGE_LIMIT`, `HOME`), the caches (`cachedBundle`, `hashCache`), and the
      functions `fetchText`, `loadBundle`, `loadHash`, `getAnonToken`,
      `pathfinderHeaders`, `pathfinderPage`, `scrapeAllTracks`, `getTrackYear`. Export
      `scrapeAllTracks` and `getTrackYear`; keep the rest module-private. Keep the
      `import { ... } from './src/spotify/pathfinder'` (adjust the relative path to
      `../src/spotify/pathfinder`) and the `SpotifyTrack` type import.
- [ ] Rewrite `vite-plugin-spotify-scraper.ts` to import `scrapeAllTracks`,
      `getTrackYear` from `./server/spotifyScraper` and keep only `spotifyScraperPlugin()`
      (the `configureServer` middleware, unchanged logic).
- [ ] Run `npm run dev`, hit `http://127.0.0.1:5173/api/track-year?id=<a real track
id>` and `/api/playlist-tracks?id=<a real public playlist id>`; confirm JSON comes
      back (dev parity). Stop the server.
- [ ] Commit: `refactor: extract Spotify scraper core into server/spotifyScraper.ts`.

### Task 2: Add the Vercel serverless functions

**Files:** Create `api/playlist-tracks.ts`, `api/track-year.ts`. Modify `package.json` (devDep).

- [ ] `npm i -D @vercel/node`.
- [ ] `api/playlist-tracks.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { scrapeAllTracks } from '../server/spotifyScraper'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : null
  if (!id) return res.status(400).json({ error: 'missing id' })
  try {
    res.status(200).json(await scrapeAllTracks(id))
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
}
```

- [ ] `api/track-year.ts`: same shape, calling `getTrackYear(id)` and returning
      `{ year: await getTrackYear(id) }`.
- [ ] Commit: `feat: Vercel serverless functions for the Spotify scrape endpoints`.

### Task 3: Routing + TypeScript wiring

**Files:** Create `vercel.json`. Modify `tsconfig.node.json`.

- [ ] `vercel.json`:

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

- [ ] In `tsconfig.node.json`, change `"include": ["vite.config.ts"]` to
      `"include": ["vite.config.ts", "vite-plugin-spotify-scraper.ts", "server/**/*.ts", "api/**/*.ts"]`.
- [ ] Run `npm run build`; fix any type errors in the new files. Run `npm run lint`
      and `npm run test`; all green.
- [ ] Commit: `chore: vercel.json SPA routing + typecheck server/ and api/`.

### Task 4: Deploy runbook — `DEPLOY.md`

**Files:** Create `DEPLOY.md`.

- [ ] Write step-by-step: (1) import the repo at vercel.com (framework auto-detects
      Vite, output `dist`); (2) set env vars `VITE_SPOTIFY_CLIENT_ID` and
      `VITE_SPOTIFY_REDIRECT_URI=https://<app>.vercel.app/callback`; (3) in the Spotify
      dashboard, add that same callback URL as a redirect URI; (4) add host Spotify
      accounts to the app allowlist (<=25; guest mode needs none); (5) redeploy; (6)
      smoke test: open the URL, guest-mode a public playlist, and a Spotify-login game.
- [ ] Note the datacenter-IP scrape-flakiness risk and that the redirect URI must
      exactly match the deployed domain.
- [ ] Commit: `docs: Vercel deploy runbook`.

### Final: verify + PR

- [ ] `lint` + `test` + `build` green; `npm run dev` still serves both endpoints.
- [ ] Open PR -> main. The user then connects Vercel + sets env vars + registers the
      redirect URI per `DEPLOY.md`, and shares the URL back so we confirm the redirect.
