import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Bind to 127.0.0.1 (not localhost) so the dev origin matches the Spotify
  // redirect URI exactly; on Windows, localhost can resolve to IPv6 ::1 only,
  // leaving http://127.0.0.1:5173 refusing connections.
  server: {
    host: '127.0.0.1',
    port: 5173,
    // Proxy public Spotify embed pages so the browser can read a playlist's
    // tracks without a CORS error (the Web API playlist endpoint is blocked for
    // development-mode apps). A real backend replaces this in a later phase.
    proxy: {
      '/sp-embed': {
        target: 'https://open.spotify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sp-embed/, '/embed'),
      },
      // Proxy the Spotify Web API too, so the browser can page a playlist's
      // tracks using the anonymous token scraped from the embed page (the token
      // is not tied to our development-mode app, so it sidesteps the 403 block).
      '/sp-api': {
        target: 'https://api.spotify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sp-api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})
