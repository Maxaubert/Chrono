import { useState } from 'react'

/**
 * SetupMockB — visual mockup of the Hitster "New Game" SETUP screen.
 * Cyberpunk / HUD style, two-column dashboard. VISUAL ONLY, no props.
 * All CSS scoped under `.sm-b`.
 */
export default function SetupMockB() {
  const [playerCount, setPlayerCount] = useState(3)
  const [winAt, setWinAt] = useState(10)
  const names = ['Anna', 'Ben', 'Cara', 'Dex', 'Eve', 'Finn']

  return (
    <div className="sm-b">
      <style>{css}</style>

      <div className="smb-grid" aria-hidden />
      <div className="smb-grain" aria-hidden />

      <div className="smb-frame">
        {/* HEADER */}
        <header className="smb-header">
          <div className="smb-brandwrap">
            <span className="smb-wordmark">HITSTER</span>
            <span className="smb-newgame">// NEW GAME</span>
          </div>
          <div className="smb-pillwrap">
            <div className="smb-pill">
              <span className="smb-pilldot" />
              <span className="smb-pilltext">PLAYER READY</span>
            </div>
            <button className="smb-logout">LOG OUT</button>
          </div>
        </header>

        <div className="smb-headrule" aria-hidden />

        {/* TWO COLUMNS */}
        <div className="smb-cols">
          {/* LEFT */}
          <div className="smb-col">
            <section className="smb-panel">
              <div className="smb-paneltab">01</div>
              <h2 className="smb-paneltitle">Players</h2>

              <label className="smb-label">Player Count</label>
              <div className="smb-counter">
                <button
                  className="smb-stepbtn"
                  onClick={() => setPlayerCount((c) => Math.max(2, c - 1))}
                >
                  −
                </button>
                <div className="smb-countval">{playerCount}</div>
                <button
                  className="smb-stepbtn"
                  onClick={() => setPlayerCount((c) => Math.min(6, c + 1))}
                >
                  +
                </button>
                <div className="smb-countmeta">
                  <span className="smb-countmetalabel">RANGE</span>
                  <span className="smb-countmetaval">2 – 6</span>
                </div>
              </div>

              <label className="smb-label">Names</label>
              <div className="smb-names">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div className="smb-nameRow" key={i}>
                    <span className="smb-nameIdx">P{i + 1}</span>
                    <input
                      className="smb-input smb-nameInput"
                      defaultValue={names[i]}
                      spellCheck={false}
                    />
                    <span className="smb-nameCorner" aria-hidden />
                  </div>
                ))}
              </div>
            </section>

            <section className="smb-panel smb-panel--win">
              <div className="smb-paneltab">02</div>
              <h2 className="smb-paneltitle">Win Condition</h2>
              <label className="smb-label">Cards To Win</label>
              <div className="smb-counter smb-counter--win">
                <button
                  className="smb-stepbtn"
                  onClick={() => setWinAt((w) => Math.max(3, w - 1))}
                >
                  −
                </button>
                <div className="smb-countval smb-countval--big">{winAt}</div>
                <button
                  className="smb-stepbtn"
                  onClick={() => setWinAt((w) => Math.min(20, w + 1))}
                >
                  +
                </button>
                <div className="smb-countmeta">
                  <span className="smb-countmetalabel">FIRST TO</span>
                  <span className="smb-countmetaval">{winAt} CARDS</span>
                </div>
              </div>
              <p className="smb-hint">
                First player to build a timeline of {winAt} cards wins the
                round.
              </p>
            </section>
          </div>

          {/* RIGHT */}
          <div className="smb-col">
            <section className="smb-panel smb-panel--spotify">
              <div className="smb-paneltab">03</div>
              <h2 className="smb-paneltitle">Spotify / Playlist</h2>

              <label className="smb-label">Spotify Playlist Link</label>
              <div className="smb-linkrow">
                <input
                  className="smb-input smb-linkinput"
                  defaultValue="https://open.spotify.com/playlist/37i9dQZF1DX..."
                  spellCheck={false}
                />
                <button className="smb-btn smb-btn--accent">IMPORT</button>
              </div>

              <div className="smb-srcrow">
                <button className="smb-btn smb-btn--ghost smb-myplaylists">
                  <span className="smb-folderIco" aria-hidden />
                  MY PLAYLISTS
                </button>
                <div className="smb-songcount">
                  <span className="smb-songdot" />
                  <span className="smb-songnum">247</span>
                  <span className="smb-songlabel">SONGS</span>
                </div>
              </div>

              <label className="smb-label smb-label--gap">
                Example Playlists
              </label>
              <div className="smb-examples">
                {[
                  { name: 'All Out 2000s', songs: 200, tag: 'POP' },
                  { name: 'Rock Classics', songs: 150, tag: 'ROCK' },
                  { name: 'Hitster Originals', songs: 432, tag: 'MIX' },
                ].map((p) => (
                  <div className="smb-exRow" key={p.name}>
                    <span className="smb-exBars" aria-hidden>
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <div className="smb-exMeta">
                      <span className="smb-exName">{p.name}</span>
                      <span className="smb-exSub">
                        <span className="smb-exTag">{p.tag}</span>
                        {p.songs} songs
                      </span>
                    </div>
                    <button className="smb-btn smb-btn--use">USE</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="smb-footer">
          <div className="smb-footstat">
            <span className="smb-footlabel">PLAYERS</span>
            <span className="smb-footval">{playerCount}</span>
          </div>
          <div className="smb-footdivider" aria-hidden />
          <div className="smb-footstat">
            <span className="smb-footlabel">WIN AT</span>
            <span className="smb-footval">{winAt}</span>
          </div>
          <div className="smb-footdivider" aria-hidden />
          <div className="smb-footstat">
            <span className="smb-footlabel">TRACKS</span>
            <span className="smb-footval">247</span>
          </div>
          <button className="smb-start">
            <span className="smb-startglyph" aria-hidden />
            <span className="smb-starttext">START GAME</span>
            <span className="smb-startarrow" aria-hidden>
              ▶
            </span>
          </button>
        </footer>
      </div>
    </div>
  )
}

const css = `
.sm-b {
  --smb-bg: #08060f;
  --smb-accent: #9a6bff;
  --smb-accent2: #6b3fd6;
  --smb-ink: #0f0820;
  --smb-panel: #0e0a1a;
  --smb-glow: rgba(154,107,255,.17);
  --smb-line: rgba(154,107,255,.28);
  --smb-text: #e7e0ff;
  --smb-dim: #9a8fc4;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background: var(--smb-bg);
  color: var(--smb-text);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.sm-b *, .sm-b *::before, .sm-b *::after { box-sizing: border-box; }

.sm-b .smb-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(154,107,255,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(154,107,255,.06) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 30%, #000 40%, transparent 100%);
}
.sm-b .smb-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
  background:
    radial-gradient(900px 500px at 18% -5%, rgba(107,63,214,.22), transparent 60%),
    radial-gradient(800px 600px at 100% 110%, rgba(154,107,255,.14), transparent 55%);
}

.sm-b .smb-frame {
  position: relative; z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 34px clamp(18px, 4vw, 52px) 44px;
  min-height: 100vh;
  display: flex; flex-direction: column;
}

/* HEADER */
.sm-b .smb-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 18px; flex-wrap: wrap;
}
.sm-b .smb-brandwrap { display: flex; align-items: baseline; gap: 16px; }
.sm-b .smb-wordmark {
  font-size: 30px; font-weight: 800; letter-spacing: .22em;
  color: #fff;
  text-shadow: 0 0 18px var(--smb-glow), 0 0 4px rgba(154,107,255,.5);
}
.sm-b .smb-newgame {
  font-size: 13px; font-weight: 700; letter-spacing: .34em;
  color: var(--smb-accent);
  opacity: .9;
}
.sm-b .smb-pillwrap { display: flex; align-items: center; gap: 14px; }
.sm-b .smb-pill {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 8px 16px;
  background: linear-gradient(180deg, rgba(154,107,255,.14), rgba(154,107,255,.05));
  border: 1px solid var(--smb-line);
  box-shadow: 0 0 22px var(--smb-glow), inset 0 0 14px rgba(154,107,255,.08);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
.sm-b .smb-pilldot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #44f5b0;
  box-shadow: 0 0 10px #44f5b0, 0 0 4px #44f5b0;
  animation: smbPulse 1.8s ease-in-out infinite;
}
@keyframes smbPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.sm-b .smb-pilltext {
  font-size: 11px; font-weight: 700; letter-spacing: .22em; color: #cfe9dd;
}
.sm-b .smb-logout {
  background: none; border: none; cursor: pointer;
  font-size: 10px; font-weight: 700; letter-spacing: .2em;
  color: var(--smb-dim);
  padding: 4px 2px;
  border-bottom: 1px solid transparent;
  transition: color .15s, border-color .15s;
}
.sm-b .smb-logout:hover { color: var(--smb-accent); border-color: var(--smb-accent); }

.sm-b .smb-headrule {
  height: 1px; margin: 22px 0 26px;
  background: linear-gradient(90deg, transparent, var(--smb-line) 12%, var(--smb-line) 88%, transparent);
  position: relative;
}
.sm-b .smb-headrule::before, .sm-b .smb-headrule::after {
  content: ''; position: absolute; top: -3px; width: 7px; height: 7px;
  background: var(--smb-accent); transform: rotate(45deg);
  box-shadow: 0 0 8px var(--smb-glow);
}
.sm-b .smb-headrule::before { left: 4%; }
.sm-b .smb-headrule::after { right: 4%; }

/* COLUMNS */
.sm-b .smb-cols {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  flex: 1;
}
.sm-b .smb-col { display: flex; flex-direction: column; gap: 24px; }

/* PANELS */
.sm-b .smb-panel {
  position: relative;
  background:
    linear-gradient(180deg, rgba(154,107,255,.05), transparent 40%),
    var(--smb-panel);
  border: 1px solid var(--smb-line);
  box-shadow: 0 0 0 1px rgba(8,6,15,.6), 0 18px 40px rgba(0,0,0,.45), inset 0 0 32px rgba(154,107,255,.05);
  padding: 26px 26px 28px;
  clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
}
.sm-b .smb-panel--spotify { flex: 1; }
.sm-b .smb-paneltab {
  position: absolute; top: 0; left: 26px;
  font-size: 10px; font-weight: 800; letter-spacing: .2em;
  color: var(--smb-bg);
  background: var(--smb-accent);
  padding: 3px 10px 4px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 6px 100%);
  box-shadow: 0 0 14px var(--smb-glow);
}
.sm-b .smb-paneltitle {
  margin: 18px 0 20px;
  font-size: 15px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase;
  color: #fff;
}
.sm-b .smb-label {
  display: block;
  font-size: 10px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase;
  color: var(--smb-dim);
  margin: 0 0 10px;
}
.sm-b .smb-label--gap { margin-top: 22px; }

/* COUNTER */
.sm-b .smb-counter {
  display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
}
.sm-b .smb-stepbtn {
  width: 42px; height: 42px; flex: none;
  background: linear-gradient(180deg, rgba(154,107,255,.12), rgba(154,107,255,.03));
  border: 1px solid var(--smb-line);
  color: var(--smb-accent);
  font-size: 22px; font-weight: 700; line-height: 1; cursor: pointer;
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
  transition: background .15s, box-shadow .15s, color .15s;
}
.sm-b .smb-stepbtn:hover {
  background: rgba(154,107,255,.22);
  box-shadow: 0 0 18px var(--smb-glow);
  color: #fff;
}
.sm-b .smb-countval {
  min-width: 64px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 800; color: #fff;
  background: var(--smb-ink);
  border: 1px solid var(--smb-line);
  box-shadow: inset 0 0 18px rgba(154,107,255,.12);
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
}
.sm-b .smb-countval--big { min-width: 78px; font-size: 30px; }
.sm-b .smb-countmeta {
  margin-left: auto; text-align: right; display: flex; flex-direction: column; gap: 3px;
}
.sm-b .smb-countmetalabel {
  font-size: 9px; font-weight: 700; letter-spacing: .24em; color: var(--smb-dim);
}
.sm-b .smb-countmetaval {
  font-size: 13px; font-weight: 700; letter-spacing: .1em; color: var(--smb-accent);
}

/* NAMES */
.sm-b .smb-names { display: flex; flex-direction: column; gap: 10px; }
.sm-b .smb-nameRow { position: relative; display: flex; align-items: center; gap: 10px; }
.sm-b .smb-nameIdx {
  width: 30px; flex: none; text-align: center;
  font-size: 11px; font-weight: 800; letter-spacing: .08em;
  color: var(--smb-accent);
}
.sm-b .smb-input {
  width: 100%;
  background: var(--smb-ink);
  border: 1px solid var(--smb-line);
  color: var(--smb-text);
  font-size: 14px; font-weight: 600; letter-spacing: .03em;
  padding: 11px 14px;
  outline: none;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.sm-b .smb-input:focus {
  border-color: var(--smb-accent);
  box-shadow: 0 0 0 1px var(--smb-accent), 0 0 18px var(--smb-glow);
  background: #120a26;
}
.sm-b .smb-input::selection { background: rgba(154,107,255,.4); }
.sm-b .smb-nameInput { flex: 1; }
.sm-b .smb-nameCorner {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 5px; height: 5px; background: var(--smb-accent2);
  box-shadow: 0 0 6px var(--smb-glow);
}

.sm-b .smb-hint {
  margin: 14px 0 0; font-size: 12px; line-height: 1.5; color: var(--smb-dim);
}

/* SPOTIFY */
.sm-b .smb-linkrow { display: flex; gap: 10px; margin-bottom: 16px; }
.sm-b .smb-linkinput { flex: 1; font-size: 12px; font-weight: 500; }
.sm-b .smb-btn {
  font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
  cursor: pointer; padding: 11px 18px; flex: none;
  border: 1px solid var(--smb-line);
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
  transition: background .15s, box-shadow .15s, color .15s, border-color .15s;
}
.sm-b .smb-btn--accent {
  background: linear-gradient(180deg, var(--smb-accent), var(--smb-accent2));
  color: #fff; border-color: var(--smb-accent);
  box-shadow: 0 0 20px var(--smb-glow);
}
.sm-b .smb-btn--accent:hover { box-shadow: 0 0 28px rgba(154,107,255,.4); }
.sm-b .smb-btn--ghost {
  background: rgba(154,107,255,.06); color: var(--smb-text);
}
.sm-b .smb-btn--ghost:hover { background: rgba(154,107,255,.16); border-color: var(--smb-accent); }

.sm-b .smb-srcrow {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
}
.sm-b .smb-myplaylists { display: inline-flex; align-items: center; gap: 9px; }
.sm-b .smb-folderIco {
  width: 13px; height: 11px; flex: none; position: relative;
  border: 1.5px solid var(--smb-accent); border-radius: 2px;
}
.sm-b .smb-folderIco::before {
  content: ''; position: absolute; top: -4px; left: -1px;
  width: 6px; height: 3px; border: 1.5px solid var(--smb-accent);
  border-bottom: none; border-radius: 2px 2px 0 0;
}
.sm-b .smb-songcount {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--smb-line);
  background: var(--smb-ink);
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
}
.sm-b .smb-songdot {
  width: 7px; height: 7px; border-radius: 50%; background: #1ed760;
  box-shadow: 0 0 8px #1ed760;
}
.sm-b .smb-songnum { font-size: 16px; font-weight: 800; color: #fff; }
.sm-b .smb-songlabel { font-size: 10px; font-weight: 700; letter-spacing: .2em; color: var(--smb-dim); }

/* EXAMPLE ROWS */
.sm-b .smb-examples { display: flex; flex-direction: column; gap: 10px; }
.sm-b .smb-exRow {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px;
  background: linear-gradient(90deg, rgba(154,107,255,.05), transparent);
  border: 1px solid rgba(154,107,255,.18);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition: border-color .15s, background .15s;
}
.sm-b .smb-exRow:hover {
  border-color: var(--smb-accent);
  background: linear-gradient(90deg, rgba(154,107,255,.12), transparent);
}
.sm-b .smb-exBars {
  display: inline-flex; align-items: flex-end; gap: 3px; height: 22px; width: 22px; flex: none;
}
.sm-b .smb-exBars i {
  width: 4px; background: var(--smb-accent); border-radius: 1px; opacity: .85;
  animation: smbBars 1.1s ease-in-out infinite;
}
.sm-b .smb-exBars i:nth-child(1) { height: 40%; animation-delay: 0s; }
.sm-b .smb-exBars i:nth-child(2) { height: 100%; animation-delay: .2s; }
.sm-b .smb-exBars i:nth-child(3) { height: 60%; animation-delay: .4s; }
.sm-b .smb-exBars i:nth-child(4) { height: 80%; animation-delay: .6s; }
@keyframes smbBars { 0%,100% { transform: scaleY(.5); } 50% { transform: scaleY(1); } }
.sm-b .smb-exMeta { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.sm-b .smb-exName { font-size: 14px; font-weight: 700; color: #fff; }
.sm-b .smb-exSub {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; color: var(--smb-dim);
}
.sm-b .smb-exTag {
  font-size: 9px; font-weight: 800; letter-spacing: .14em;
  color: var(--smb-accent); border: 1px solid var(--smb-line);
  padding: 2px 6px;
}
.sm-b .smb-btn--use {
  padding: 8px 16px; font-size: 10px;
  background: rgba(154,107,255,.1); color: var(--smb-accent); border-color: var(--smb-line);
}
.sm-b .smb-btn--use:hover {
  background: var(--smb-accent); color: #fff; border-color: var(--smb-accent);
  box-shadow: 0 0 16px var(--smb-glow);
}

/* FOOTER */
.sm-b .smb-footer {
  margin-top: 28px;
  display: flex; align-items: center; gap: 22px;
  padding: 20px 24px;
  background:
    linear-gradient(180deg, rgba(154,107,255,.06), transparent),
    var(--smb-panel);
  border: 1px solid var(--smb-line);
  box-shadow: 0 -2px 30px rgba(154,107,255,.08), inset 0 0 30px rgba(154,107,255,.05);
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  flex-wrap: wrap;
}
.sm-b .smb-footstat { display: flex; flex-direction: column; gap: 4px; }
.sm-b .smb-footlabel { font-size: 9px; font-weight: 700; letter-spacing: .24em; color: var(--smb-dim); }
.sm-b .smb-footval { font-size: 22px; font-weight: 800; color: #fff; line-height: 1; }
.sm-b .smb-footdivider { width: 1px; height: 34px; background: var(--smb-line); }

.sm-b .smb-start {
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 14px;
  padding: 16px 38px;
  background: linear-gradient(120deg, var(--smb-accent2), var(--smb-accent));
  border: 1px solid var(--smb-accent);
  color: #fff; cursor: pointer;
  font-size: 16px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase;
  box-shadow: 0 0 28px var(--smb-glow), 0 8px 24px rgba(107,63,214,.4), inset 0 0 18px rgba(255,255,255,.08);
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  transition: box-shadow .18s, transform .1s;
}
.sm-b .smb-start:hover {
  box-shadow: 0 0 40px rgba(154,107,255,.55), 0 10px 30px rgba(107,63,214,.5), inset 0 0 18px rgba(255,255,255,.12);
}
.sm-b .smb-start:active { transform: translateY(1px); }
.sm-b .smb-startglyph {
  width: 14px; height: 14px; flex: none; position: relative;
}
.sm-b .smb-startglyph::before, .sm-b .smb-startglyph::after {
  content: ''; position: absolute; background: #fff;
}
.sm-b .smb-startglyph::before { left: 6px; top: 0; width: 2px; height: 14px; }
.sm-b .smb-startglyph::after { left: 0; top: 6px; width: 14px; height: 2px; }
.sm-b .smb-startarrow { font-size: 12px; opacity: .9; }

@media (max-width: 860px) {
  .sm-b .smb-cols { grid-template-columns: 1fr; }
  .sm-b .smb-start { margin-left: 0; width: 100%; justify-content: center; }
}
`
