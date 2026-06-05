import type { AudioTrackRef } from '@/audio'

/** Prefix marking a QR as one of ours. Opaque token, deliberately not a URL. */
const PREFIX = 'chrono:t:'

/** Spotify ids are base62. Validate so junk QRs are rejected. */
const ID_RE = /^[A-Za-z0-9]+$/

export function encodeTrackToken(trackId: string): string {
  return `${PREFIX}${trackId}`
}

export function decodeTrackToken(text: string): string | null {
  if (!text.startsWith(PREFIX)) return null
  const id = text.slice(PREFIX.length)
  return ID_RE.test(id) ? id : null
}

export function trackIdToUri(trackId: string): AudioTrackRef {
  return { uri: `spotify:track:${trackId}` }
}
