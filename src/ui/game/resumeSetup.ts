// Spotify login is a full-page redirect, so all in-memory React state is lost
// across the round-trip. This one-shot sessionStorage flag remembers that the
// host left the new-game setup wizard to authenticate, so they return to the
// wizard instead of the front page.
//
// Read and clear are split (rather than a single take()) so the read can run
// from a useState initializer purely (StrictMode invokes it twice), while the
// clear happens once in an effect.

const KEY = 'chrono.resumeSetup'

/** Call right before redirecting to Spotify from the setup login gate. */
export function markResumeSetup(): void {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // sessionStorage can throw in private mode; resume is best-effort.
  }
}

/** Pure read: true when the host should be returned to the setup wizard. */
export function peekResumeSetup(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Clear the one-shot flag so a later reload shows the menu as normal. */
export function clearResumeSetup(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore unavailable storage
  }
}
