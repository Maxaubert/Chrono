# Deploying Chrono to Vercel

Chrono is a Vite SPA plus two serverless functions (`api/playlist-tracks`,
`api/track-year`) that read public Spotify playlists. Vercel serves both. This is a
one-time setup; afterwards every push to `main` auto-deploys and every PR gets a
preview URL.

## Prerequisites

- A Vercel account (free), signed in with the GitHub account that owns the repo.
- The existing Spotify app (same `client ID` as your local `.env`
  `VITE_SPOTIFY_CLIENT_ID`). No new app needed.

## 1. Import the repo

1. Go to https://vercel.com/new and import **Maxaubert/Chrono**.
2. Vercel auto-detects **Vite** — leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: repo root (`./`)
3. Deploy. The first build succeeds and gives you a URL like
   `https://chrono-xxxx.vercel.app`. **Guest mode already works at this point**
   (it needs no login). Spotify-login mode needs the env vars below.

## 2. Set environment variables

In the Vercel project: **Settings → Environment Variables** (apply to Production
**and** Preview). `VITE_`-prefixed vars are inlined at build time.

| Name                        | Value                                         |
| --------------------------- | --------------------------------------------- |
| `VITE_SPOTIFY_CLIENT_ID`    | your Spotify client ID (same as local `.env`) |
| `VITE_SPOTIFY_REDIRECT_URI` | `https://<your-app>.vercel.app/callback`      |

Use the exact domain Vercel gave you in step 1 (or your custom domain). Then
**redeploy** (Deployments → ⋯ → Redeploy) so the new vars are baked in.

## 3. Register the redirect URI in Spotify

https://developer.spotify.com/dashboard → your app → **Settings → Edit → Redirect
URIs**. Add, exactly (https, `/callback`, no trailing slash):

```
https://<your-app>.vercel.app/callback
```

Keep your existing `http://127.0.0.1:5173/callback` for local dev. Save.

## 4. Allowlist the host accounts (Spotify dev mode)

The app is in Spotify "development mode": only allowlisted accounts can log in
(max 25). In the dashboard → **User Management**, add the Spotify account (name +
email) of anyone who will use **Spotify-login mode**. Each needs Spotify **Premium**.
**Guest mode needs none of this.**

## 5. Smoke test

Open the deployed URL and check both modes:

- **Guest mode:** PLAY → "play as guest" → paste a public playlist → start. The
  mystery card shows a QR; scanning it opens the song in your phone's Spotify.
- **Spotify mode (desktop):** PLAY → log in with an allowlisted Premium account →
  the full song plays in-browser, the mystery card stays a blank "?".

## Notes & caveats

- The `/api/*` functions are auto-detected from the `api/` folder; the SPA rewrite
  in `vercel.json` serves `index.html` for client routes like `/callback`.
- **Scrape flakiness:** the playlist scrape runs from Vercel's datacenter IPs, which
  Spotify rate-limits more aggressively than a home machine. Imports may
  occasionally fail and need a retry. The durable fix (a real backend or shipping
  curated static decks) is future work.
- The redirect URI must match the deployed domain **exactly**, or login fails.
- **Public endpoints:** `/api/playlist-tracks` and `/api/track-year` are
  unauthenticated. They validate the `id` as a Spotify base62 id (no SSRF), cap each
  request to `MAX_TRACKS` (no unbounded fan-out), **IP-rate-limit to 40 req/min**
  (HTTP 429 + `Retry-After`), and only ever return public Spotify data. The limiter
  is in-memory, so it caps per warm serverless instance, not globally across the
  fleet — fine for a hobby app. For hard distributed limits, back it with Vercel KV /
  Upstash or use the Vercel Firewall.
- Auto-deploy: once connected, pushing to `main` redeploys automatically.
