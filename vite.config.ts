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
