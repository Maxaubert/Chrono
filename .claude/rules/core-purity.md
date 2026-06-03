---
paths: src/core/**
---

# Core purity

`src/core/` is the framework-agnostic game engine. It MUST NOT import:

- React or any UI library
- Spotify SDKs, `fetch`, or any audio/network code
- Browser/DOM globals (`window`, `document`, ...)

Keep it pure TypeScript so it stays unit-testable in isolation and portable to a
future native (React Native) build. UI lives in `src/ui/`, playback in
`src/audio/`, and per-game data/rules in `src/games/<game>/`.
