---
name: run-app
description: Launch the Chrono dev server (or build/preview) to see changes live or take screenshots. Use when asked to run, start, preview, or screenshot the app.
---

# Run the app

- **Dev server:** `npm run dev` — Vite at http://localhost:5173. Long-running;
  start it in the background and watch output for the URL.
- **Production preview:** `npm run build` then `npm run preview`.
- **E2E (boots the dev server automatically):** `npm run test:e2e`.

To verify a UI change, prefer driving the app with Playwright (the project's E2E
setup) over manual screenshots.
