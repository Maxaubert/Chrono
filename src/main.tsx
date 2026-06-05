import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './ui/App.tsx'
import { registerBuiltInGames } from './games'
import { loopbackRedirect } from './spotify/loopback'

// Keep the app on 127.0.0.1 so the Spotify PKCE verifier (stored per-origin)
// survives the redirect to the registered 127.0.0.1 callback. Must run before
// anything renders.
const loopback = loopbackRedirect(
  window.location.href,
  window.location.hostname,
)
if (loopback) {
  window.location.replace(loopback)
} else {
  registerBuiltInGames()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
