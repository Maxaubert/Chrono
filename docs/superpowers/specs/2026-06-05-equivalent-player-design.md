# Our Own "Hitster-Equivalent" Player — Design (phase 2)

**Date:** 2026-06-05
**Depends on:** the Vercel deploy (the player must live at a real hosted URL).

## Goal

A Chrono-native version of Hitster's clean experience: the song plays for the table
with **no title shown** and **without opening the Spotify app**, while sidestepping
the 25-user dev-mode cap as far as possible. We build our own (we can't use
Hitster's app, links, or catalog).

## The hard constraint (why there is a fork, not one answer)

You cannot have all three of **no-login + full-song + hidden-title** at once:

- **Full song + hidden title** must play through the Web Playback SDK / Spotify
  Connect, which **requires a Spotify login** — and login is exactly what the
  25-user cap counts. (Desktop SDK is clean; on a phone, Connect plays via the
  native app and the OS notification leaks the title.)
- **No login** means either a Spotify-app deep link (opens the app, shows the title)
  or a **30-second preview clip** played in our own page (hidden title, but a clip).

Hitster itself pays for the clean experience with a mandatory Premium login; it just
has full commercial quota instead of a 25-cap.

## The three coherent products

| Product                         | Login?      | Cap?        | Song     | Title hidden?                      | Plays where                               |
| ------------------------------- | ----------- | ----------- | -------- | ---------------------------------- | ----------------------------------------- |
| **Spotify mode** (exists)       | yes, 1/game | <=25 logins | full     | yes (blank "?")                    | in our page, **desktop only** (SDK)       |
| **A. Full-song routed player**  | yes         | <=25        | full     | yes desktop / leaks on phone notif | our page; phone via Connect to native app |
| **B. Clip player** (iTunes 30s) | **none**    | **none**    | 30s clip | yes                                | our page, **any device incl. phone**      |
| Guest QR (exists)               | none        | none        | full     | no (Spotify shows it)              | opens Spotify app                         |

## Recommendation

For "our own equivalent system" that meets the stated constraints (no cap, hidden
title, plays on a phone, never opens Spotify) the only option that satisfies **all**
of them is **B — the iTunes 30-second preview provider**:

- A new `AudioProvider` that plays the track's iTunes `previewUrl` (free, no auth,
  CORS-ok; we already call iTunes for album art) in a bare `<audio>` element behind
  the existing blank "?" mystery card.
- No Spotify login, so no cap; plays in-page on any phone; title stays hidden; the
  Spotify app is never involved.
- Trade-off: 30-second clips (fine for a year-guessing game), and each track needs an
  iTunes match (by artist+title) or a curated deck that ships the preview URLs.

Full-length songs with a hidden title already exist as **Spotify mode** (1 login per
game, cap is a non-issue at that scale) and become available the moment the Vercel
deploy lands — best on a laptop/TV as the table's playback device.

## Routed player page (`/play?t=<trackId>`) — only if multi-device

A QR -> hosted player page is needed only when the **board is on one device and audio
on another** (scan to a separate phone). For same-device pass-and-play, the mystery
card just plays directly (no QR). We add the routed page only if the separate-phone
flow is wanted; it would host whichever provider (A or B) we choose.

## Open decision (to pick before this gets an implementation plan)

1. **B — no-login iTunes clip player** (recommended): no cap, hidden, any phone; 30s clips.
2. **A — full-song routed player** (SDK desktop / Connect phone): full songs, hidden on
   desktop, but login (<=25) and a title leak via the phone's notification.
3. Both, in sequence.

## Out of scope (here)

- The Vercel deploy itself (its own plan).
- A curated "classic" deck (separate; pairs well with B since it can ship preview URLs).
