/**
 * Spotify's PKCE flow stores the code verifier per browser origin, and the
 * registered redirect URI uses the loopback IP (127.0.0.1). `localhost` and
 * `127.0.0.1` are different origins, so if login starts on `localhost` the
 * verifier saved there is missing when Spotify redirects back to `127.0.0.1`,
 * and the token exchange silently fails (login appears to need two tries).
 *
 * Returns the `127.0.0.1` href to redirect to when the page is on `localhost`,
 * or null when the current host is fine.
 */
export function loopbackRedirect(
  href: string,
  hostname: string,
): string | null {
  if (hostname !== 'localhost') return null
  return href.replace('://localhost', '://127.0.0.1')
}
