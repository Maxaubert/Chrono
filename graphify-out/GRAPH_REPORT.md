# Graph Report - .  (2026-06-21)

## Corpus Check
- Large corpus: 475 files · ~2,583,538 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 601 nodes · 1016 edges · 43 communities (35 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.82)
- Token cost: 248,288 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Spotify Auth & API Client|Spotify Auth & API Client]]
- [[_COMMUNITY_Game Setup & Session|Game Setup & Session]]
- [[_COMMUNITY_Core Engine & Platform Concepts|Core Engine & Platform Concepts]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Serverless API & Spotify Scraper|Serverless API & Spotify Scraper]]
- [[_COMMUNITY_Game Registry & Theming|Game Registry & Theming]]
- [[_COMMUNITY_Core Game State & Transitions|Core Game State & Transitions]]
- [[_COMMUNITY_iTunes & Mock Audio Providers|iTunes & Mock Audio Providers]]
- [[_COMMUNITY_Deck-Driven Game Design|Deck-Driven Game Design]]
- [[_COMMUNITY_TS App Config|TS App Config]]
- [[_COMMUNITY_Guest Mode & Serverless Playback|Guest Mode & Serverless Playback]]
- [[_COMMUNITY_Hand & Card Rendering|Hand & Card Rendering]]
- [[_COMMUNITY_Spotify Playback Provider|Spotify Playback Provider]]
- [[_COMMUNITY_TS Node Config|TS Node Config]]
- [[_COMMUNITY_Play Container & Adapter|Play Container & Adapter]]
- [[_COMMUNITY_Star Wars Deck & Play|Star Wars Deck & Play]]
- [[_COMMUNITY_QR Scanner|QR Scanner]]
- [[_COMMUNITY_Audio Provider & Spotify Spike|Audio Provider & Spotify Spike]]
- [[_COMMUNITY_History Deck & Play|History Deck & Play]]
- [[_COMMUNITY_Hitster Deck|Hitster Deck]]
- [[_COMMUNITY_Game Background Visuals|Game Background Visuals]]
- [[_COMMUNITY_Spotify Spike Harness|Spotify Spike Harness]]
- [[_COMMUNITY_Static Deck Builder|Static Deck Builder]]
- [[_COMMUNITY_Prettier Config|Prettier Config]]
- [[_COMMUNITY_Star Wars Deck Validation|Star Wars Deck Validation]]
- [[_COMMUNITY_Player Overview|Player Overview]]
- [[_COMMUNITY_Vite Env Types|Vite Env Types]]
- [[_COMMUNITY_TS Project References|TS Project References]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Guest Mode Rationale|Guest Mode Rationale]]
- [[_COMMUNITY_Routed Player Page|Routed Player Page]]
- [[_COMMUNITY_SPA Routing|SPA Routing]]
- [[_COMMUNITY_Scrape Flakiness Risk|Scrape Flakiness Risk]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `useActiveGame()` - 17 edges
3. `compilerOptions` - 16 edges
4. `ItunesPreviewProvider` - 11 edges
5. `SpotifyProvider` - 11 edges
6. `scripts` - 10 edges
7. `getTrackYear()` - 10 edges
8. `isSpotifyId()` - 9 edges
9. `scrapeAllTracks()` - 9 edges
10. `MockProvider` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Web API playlist client (parse + paged fetch)` --semantically_similar_to--> `/api/playlist-tracks serverless endpoint`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-06-03-hitster-playback-scan-spike.md → DEPLOY.md
- `index.html app entry mounting #root` --references--> `Chrono timeline-guessing card game platform`  [INFERRED]
  index.html → CLAUDE.md
- `startGame engine transition` --implements--> `Pure framework-agnostic core engine boundary`  [INFERRED]
  docs/superpowers/plans/2026-06-03-game-loop.md → CLAUDE.md
- `Order-a-card-on-a-numeric-scale engine generalization` --conceptually_related_to--> `Pure framework-agnostic core engine boundary`  [INFERRED]
  roadmap.md → CLAUDE.md
- `/api/track-year serverless endpoint` --conceptually_related_to--> `Spotify release_date reissue-year inaccuracy`  [INFERRED]
  DEPLOY.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pure game engine state transitions** — plans_2026_06_03_game_loop_startgame, plans_2026_06_03_game_loop_placecard, plans_2026_06_03_game_loop_advanceturn [EXTRACTED 1.00]
- **Spotify PKCE auth + Web Playback flow** — plans_2026_06_03_hitster_playback_scan_spike_pkce, plans_2026_06_03_hitster_playback_scan_spike_auth, plans_2026_06_03_hitster_playback_scan_spike_sdk, plans_2026_06_03_hitster_playback_scan_spike_provider [EXTRACTED 1.00]
- **Game play screen UI composition** — plans_2026_06_05_game_screen_gamescreen, plans_2026_06_05_game_screen_hand, plans_2026_06_05_game_screen_mysterycard, plans_2026_06_05_game_screen_gamebackground [EXTRACTED 1.00]
- **Shared deck-driven engine (History + Star Wars on one adapter)** — specs_2026_06_05_history_game_design_game_play_adapter, specs_2026_06_07_starwars_deck_design_shared_deck_adapter, plans_2026_06_07_starwars_deck_static_deck_helper, plans_2026_06_07_starwars_deck_make_deck_play [INFERRED 0.85]
- **No-login guest playback options (QR deep-link vs iTunes clip)** — specs_2026_06_05_guest_qr_mode_design_guest_mode, specs_2026_06_05_equivalent_player_design_itunes_clip_option_b, plans_2026_06_05_guest_qr_mode_guest_provider, plans_2026_06_05_guest_clip_audio_itunes_preview_provider [INFERRED 0.85]
- **Spotify scrape core powering dev + serverless deploy** — specs_2026_06_05_vercel_deploy_design_scraper_core, plans_2026_06_05_vercel_deploy_spotifyscraper_core, plans_2026_06_05_vercel_deploy_serverless_functions, plans_2026_06_05_vercel_deploy_vite_plugin_scraper [INFERRED 0.85]

## Communities (43 total, 8 thin omitted)

### Community 0 - "Spotify Auth & API Client"
Cohesion: 0.09
Nodes (41): hasValidToken(), buildAuthorizeUrl(), clearTokens(), clearVerifier(), exchangeCodeForTokens(), isExpired(), loadTokens(), mapTokenResponse() (+33 more)

### Community 1 - "Game Setup & Session"
Cohesion: 0.08
Nodes (28): StaticDeckSetup(), clearResumeSetup(), markResumeSetup(), peekResumeSetup(), Added, dedupeTracks(), SetupResult, SetupScreen() (+20 more)

### Community 2 - "Core Engine & Platform Concepts"
Cohesion: 0.06
Nodes (47): Pure framework-agnostic core engine boundary, Chrono timeline-guessing card game platform, Pluggable game modules + registry architecture, Distinct-years requirement for unambiguous placement, History deck 100 events master list, index.html app entry mounting #root, advanceTurn engine transition (rotation/win/exhaustion), Deck buildDeck shuffle + takeNextDrawn draw (+39 more)

### Community 3 - "NPM Dependencies"
Cohesion: 0.04
Nodes (45): dependencies, qrcode, react, react-dom, @zxing/browser, devDependencies, eslint, eslint-config-prettier (+37 more)

### Community 4 - "Serverless API & Spotify Scraper"
Cohesion: 0.11
Nodes (33): handler(), handler(), apiRateLimit, clientIp(), createRateLimiter(), Headers, RateLimitResult, fetchText() (+25 more)

### Community 5 - "Game Registry & Theming"
Cohesion: 0.10
Nodes (22): registerBuiltInGames(), getGame(), listGames(), registerGame(), registry, resetRegistry(), GameModule, GameTheme (+14 more)

### Community 6 - "Core Game State & Transitions"
Cohesion: 0.14
Nodes (24): advanceTurn(), currentPlayer(), DrawnCard, GameConfig, GameState, isWon(), leaderId(), Phase (+16 more)

### Community 7 - "iTunes & Mock Audio Providers"
Cohesion: 0.17
Nodes (5): ItunesPreviewProvider, ItunesSearch, MockProvider, AudioProvider, AudioTrackRef

### Community 8 - "Deck-Driven Game Design"
Cohesion: 0.10
Nodes (23): makeDeckPlay shared deck-driven GamePlay, Star Wars GameModule (theme, skin, FanCard, deck.json), makeStaticDeck / shuffle helper, StaticDeckSetup theme-driven setup popup, TypographicMystery image-less clue card, yearLabel on CardReveal + timeline (BBY/ABY/BCE), UI deck.ts (buildDeck/drawReveal, lazy year fetch), Pure game engine (core/game.ts transitions) (+15 more)

### Community 9 - "TS App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 10 - "Guest Mode & Serverless Playback"
Cohesion: 0.12
Nodes (19): AudioTrackRef artist/title search hints, ItunesPreviewProvider (in-page iTunes 30s clip), Removal of QR mystery card / QR handoff (Option B), Guest Mode (paste playlist + QR playback), GuestProvider (no-op AudioProvider), MysteryCard QR variant, trackIdToOpenUrl deep-link helper, useSpotifySession guest mode (+11 more)

### Community 11 - "Hand & Card Rendering"
Cohesion: 0.17
Nodes (9): cardGradient(), Hand(), Item, pickedLayout(), timeline, HandCard(), CardTransform, handLayout (+1 more)

### Community 12 - "Spotify Playback Provider"
Cohesion: 0.18
Nodes (4): SpotifyProvider, ConnectedPlayer, createConnectedPlayer(), loadSdk()

### Community 13 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 14 - "Play Container & Adapter"
Cohesion: 0.21
Nodes (11): DeckPlayConfig, GameContainer(), useGame(), GameAudio, GamePlay, GameSetupProps, GameSetupResult, MysteryProps (+3 more)

### Community 15 - "Star Wars Deck & Play"
Cohesion: 0.17
Nodes (11): makeDeckPlay(), Mystery, Raw, makeTypographicMystery(), CARDS, clueBySlug, Card, cards (+3 more)

### Community 16 - "QR Scanner"
Cohesion: 0.23
Nodes (4): MockScanner, renderQrDataUrl(), CameraQrScanner, QrScanner

### Community 17 - "Audio Provider & Spotify Spike"
Cohesion: 0.19
Nodes (13): AudioProvider swappable playback interface, Spotify release_date reissue-year inaccuracy, Spotify Web Playback SDK playback (PKCE, Premium-only), /api/playlist-tracks serverless endpoint, /api/track-year serverless endpoint, In-memory IP rate limiting (40 req/min) on public endpoints, Vercel deployment of Chrono SPA + serverless functions, Spotify auth URL, token exchange/refresh, storage (+5 more)

### Community 18 - "History Deck & Play"
Cohesion: 0.29
Nodes (7): CARDS, clueBySlug, HistoryCardData, imageBySlug, makeHistoryDeck(), HistoryMystery(), makeHistoryPlay()

### Community 19 - "Hitster Deck"
Cohesion: 0.33
Nodes (4): buildDeck(), takeNextDrawn(), makeHitsterDeck(), DeckHandle

### Community 20 - "Game Background Visuals"
Cohesion: 0.25
Nodes (3): Bar, EQ_BACK, EQ_FRONT

### Community 21 - "Spotify Spike Harness"
Cohesion: 0.38
Nodes (4): createSpikeDeps(), SpikeDeps, Card, SpikeHarness()

### Community 22 - "Static Deck Builder"
Cohesion: 0.53
Nodes (3): makeStaticDeck(), shuffle(), Raw

### Community 23 - "Prettier Config"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 24 - "Star Wars Deck Validation"
Cohesion: 0.50
Nodes (3): ALLOWED, cards, TaggedCard

## Knowledge Gaps
- **155 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `name` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadTokens()` connect `Spotify Auth & API Client` to `Spotify Spike Harness`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `SpikeHarness()` connect `Spotify Spike Harness` to `Spotify Auth & API Client`, `Game Setup & Session`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `SpotifyTrack` connect `Spotify Auth & API Client` to `Serverless API & Spotify Scraper`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Spotify Auth & API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.08735150244584207 - nodes in this community are weakly interconnected._
- **Should `Game Setup & Session` be split into smaller, more focused modules?**
  _Cohesion score 0.07918367346938776 - nodes in this community are weakly interconnected._
- **Should `Core Engine & Platform Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.05550416281221091 - nodes in this community are weakly interconnected._