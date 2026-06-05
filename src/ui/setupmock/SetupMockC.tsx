import { useState } from 'react'

/**
 * SetupMockC — visual mockup of the Hitster "New Game" setup screen.
 * Cyberpunk / HUD style, stepped wizard. VISUAL ONLY (no real game logic).
 * All CSS scoped under `.sm-c`; class names prefixed `smc`.
 */
export default function SetupMockC() {
  const [active, setActive] = useState<number>(0)

  const steps = [
    { id: '01', label: 'PLAYERS' },
    { id: '02', label: 'WIN' },
    { id: '03', label: 'PLAYLIST' },
  ]

  return (
    <div className="sm-c">
      <style>{css}</style>

      <div className="smcScene">
        <div className="smcGrid" aria-hidden />
        <div className="smcGlowA" aria-hidden />
        <div className="smcGlowB" aria-hidden />

        <div className="smcFrame">
          {/* ── Header ─────────────────────────────── */}
          <header className="smcHead">
            <div className="smcBrand">
              <span className="smcLogo">HITSTER</span>
              <span className="smcSub">// NEW GAME</span>
            </div>
            <div className="smcHeadMeta">
              <span className="smcDot" />
              <span>SETUP · SYS.READY</span>
            </div>
          </header>

          {/* ── Step progress indicator ────────────── */}
          <nav className="smcSteps" aria-label="Setup steps">
            {steps.map((s, i) => {
              const state =
                i === active ? 'is-active' : i < active ? 'is-done' : 'is-todo'
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`smcStep ${state}`}
                  onClick={() => setActive(i)}
                >
                  <span className="smcStepTick" />
                  <span className="smcStepId">{s.id}</span>
                  <span className="smcStepLabel">{s.label}</span>
                  {i < steps.length - 1 && <span className="smcStepLink" />}
                </button>
              )
            })}
            <div className="smcProgRail" aria-hidden>
              <div
                className="smcProgFill"
                style={{ width: `${((active + 1) / steps.length) * 100}%` }}
              />
            </div>
          </nav>

          {/* ── Step blocks (stacked, current highlighted) ── */}
          <div className="smcBody">
            {/* STEP 1 — PLAYERS */}
            <section
              className={`smcBlock ${active === 0 ? 'is-active' : ''}`}
              onClick={() => setActive(0)}
            >
              <div className="smcBlockHead">
                <span className="smcBlockId">01</span>
                <h2 className="smcBlockTitle">Players</h2>
                <span className="smcBlockHint">2 – 6 PLAYERS</span>
              </div>

              <div className="smcRow">
                <span className="smcLabel">Count</span>
                <div className="smcCounter">
                  <button type="button" className="smcStepBtn">
                    −
                  </button>
                  <span className="smcCount">3</span>
                  <button type="button" className="smcStepBtn">
                    +
                  </button>
                </div>
              </div>

              <div className="smcNames">
                {['Anna', 'Ben', 'Cara'].map((n, i) => (
                  <label key={n} className="smcField smcField--name">
                    <span className="smcFieldTag">P{i + 1}</span>
                    <input
                      className="smcInput"
                      defaultValue={n}
                      spellCheck={false}
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* STEP 2 — WIN */}
            <section
              className={`smcBlock ${active === 1 ? 'is-active' : ''}`}
              onClick={() => setActive(1)}
            >
              <div className="smcBlockHead">
                <span className="smcBlockId">02</span>
                <h2 className="smcBlockTitle">Win Condition</h2>
                <span className="smcBlockHint">FIRST TO N</span>
              </div>

              <div className="smcRow">
                <span className="smcLabel">Cards to win</span>
                <div className="smcCounter smcCounter--big">
                  <button type="button" className="smcStepBtn">
                    −
                  </button>
                  <span className="smcCount smcCount--big">10</span>
                  <button type="button" className="smcStepBtn">
                    +
                  </button>
                </div>
              </div>
            </section>

            {/* STEP 3 — PLAYLIST */}
            <section
              className={`smcBlock ${active === 2 ? 'is-active' : ''}`}
              onClick={() => setActive(2)}
            >
              <div className="smcBlockHead">
                <span className="smcBlockId">03</span>
                <h2 className="smcBlockTitle">Playlist</h2>
                <span className="smcBlockHint">SPOTIFY · PREMIUM</span>
              </div>

              <div className="smcRow smcRow--split">
                <div className="smcStatus">
                  <span className="smcPill">
                    <span className="smcPillDot" />
                    PLAYER READY
                  </span>
                  <button type="button" className="smcLogout">
                    Log out
                  </button>
                </div>
                <span className="smcSongs">
                  <strong>247</strong> SONGS
                </span>
              </div>

              <label className="smcField smcField--full">
                <span className="smcFieldTag">URL</span>
                <input
                  className="smcInput"
                  defaultValue="open.spotify.com/playlist/37i9dQ…"
                  spellCheck={false}
                />
              </label>

              <div className="smcActions">
                <button type="button" className="smcBtn smcBtn--ghost">
                  Import
                </button>
                <button type="button" className="smcBtn smcBtn--ghost">
                  My Playlists
                </button>
              </div>
            </section>
          </div>

          {/* ── Footer / Start ─────────────────────── */}
          <footer className="smcFoot">
            <div className="smcFootMeta">
              <span className="smcDot" />
              READY TO LAUNCH
            </div>
            <button type="button" className="smcStart">
              <span className="smcStartLabel">START GAME</span>
              <span className="smcStartArrow">▸</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}

const css = `
.sm-c{
  --smc-bg:#08060f;
  --smc-ink:#0f0820;
  --smc-panel:#0e0a1a;
  --smc-accent:#9a6bff;
  --smc-accent2:#6b3fd6;
  --smc-glow:rgba(154,107,255,.17);
  --smc-line:rgba(154,107,255,.28);
  --smc-text:#e8e2ff;
  --smc-dim:#8d83b8;
  position:fixed; inset:0; width:100vw; height:100vh;
  margin:0; overflow:auto;
  background:var(--smc-bg);
  color:var(--smc-text);
  font-family:"Segoe UI",-apple-system,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.sm-c *{ box-sizing:border-box; margin:0; }

.smcScene{
  position:relative; min-height:100%;
  display:flex; align-items:center; justify-content:center;
  padding:32px 20px;
}
.smcGrid{
  position:absolute; inset:0; pointer-events:none;
  background-image:
    linear-gradient(var(--smc-line) 1px,transparent 1px),
    linear-gradient(90deg,var(--smc-line) 1px,transparent 1px);
  background-size:44px 44px;
  opacity:.10;
  mask-image:radial-gradient(ellipse 70% 70% at 50% 40%,#000 30%,transparent 80%);
}
.smcGlowA,.smcGlowB{ position:absolute; pointer-events:none; border-radius:50%; filter:blur(70px); }
.smcGlowA{ width:520px; height:520px; top:-160px; left:-120px;
  background:radial-gradient(circle,var(--smc-glow),transparent 70%); }
.smcGlowB{ width:460px; height:460px; bottom:-180px; right:-100px;
  background:radial-gradient(circle,rgba(107,63,214,.20),transparent 70%); }

.smcFrame{
  position:relative; z-index:1;
  width:min(720px,100%);
  background:linear-gradient(180deg,var(--smc-panel),var(--smc-ink));
  border:1px solid var(--smc-line);
  box-shadow:0 0 0 1px rgba(0,0,0,.5), 0 30px 80px rgba(0,0,0,.6),
    inset 0 0 90px var(--smc-glow);
  clip-path:polygon(0 0,100% 0,100% calc(100% - 26px),calc(100% - 26px) 100%,0 100%);
  padding:26px 26px 24px;
}

/* Header */
.smcHead{ display:flex; align-items:flex-end; justify-content:space-between;
  padding-bottom:16px; border-bottom:1px solid var(--smc-line); }
.smcBrand{ display:flex; align-items:baseline; gap:12px; }
.smcLogo{ font-size:24px; font-weight:800; letter-spacing:.22em;
  color:#fff; text-shadow:0 0 18px var(--smc-accent); }
.smcSub{ font-size:11px; letter-spacing:.28em; color:var(--smc-accent);
  font-weight:600; }
.smcHeadMeta{ display:flex; align-items:center; gap:8px; font-size:10px;
  letter-spacing:.22em; color:var(--smc-dim); }
.smcDot{ width:7px; height:7px; border-radius:50%; background:var(--smc-accent);
  box-shadow:0 0 8px var(--smc-accent); animation:smcPulse 1.8s infinite; }
@keyframes smcPulse{ 0%,100%{opacity:1;} 50%{opacity:.35;} }

/* Steps */
.smcSteps{ position:relative; display:flex; gap:10px; margin:18px 0 22px; }
.smcStep{ position:relative; flex:1; display:flex; flex-direction:column; gap:4px;
  align-items:flex-start; padding:12px 14px;
  background:rgba(154,107,255,.05);
  border:1px solid var(--smc-line);
  clip-path:polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px));
  color:var(--smc-dim); cursor:pointer; text-align:left;
  font-family:inherit; transition:.18s; }
.smcStep:hover{ border-color:var(--smc-accent); }
.smcStepTick{ position:absolute; top:0; left:0; width:26px; height:3px;
  background:var(--smc-line); }
.smcStepId{ font-size:18px; font-weight:800; letter-spacing:.05em; }
.smcStepLabel{ font-size:10px; letter-spacing:.24em; font-weight:600; }
.smcStep.is-active{ color:var(--smc-text);
  background:linear-gradient(180deg,rgba(154,107,255,.20),rgba(154,107,255,.06));
  border-color:var(--smc-accent);
  box-shadow:0 0 0 1px var(--smc-accent), 0 0 26px var(--smc-glow); }
.smcStep.is-active .smcStepTick{ background:var(--smc-accent);
  box-shadow:0 0 10px var(--smc-accent); }
.smcStep.is-active .smcStepId{ color:#fff; text-shadow:0 0 14px var(--smc-accent); }
.smcStep.is-done{ color:var(--smc-accent); }
.smcStep.is-done .smcStepTick{ background:var(--smc-accent2); }
.smcProgRail{ position:absolute; left:0; right:0; bottom:-9px; height:2px;
  background:var(--smc-line); }
.smcProgFill{ height:100%; background:linear-gradient(90deg,var(--smc-accent2),var(--smc-accent));
  box-shadow:0 0 12px var(--smc-accent); transition:width .3s; }

/* Body / blocks */
.smcBody{ display:flex; flex-direction:column; gap:14px; }
.smcBlock{ position:relative; padding:16px 18px;
  background:rgba(255,255,255,.012);
  border:1px solid rgba(154,107,255,.16);
  clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px);
  cursor:pointer; transition:.2s; opacity:.62; }
.smcBlock:hover{ opacity:.85; }
.smcBlock.is-active{ opacity:1;
  border-color:var(--smc-accent);
  background:linear-gradient(180deg,rgba(154,107,255,.08),rgba(154,107,255,.02));
  box-shadow:0 0 0 1px var(--smc-accent), inset 0 0 40px var(--smc-glow),
    0 10px 30px rgba(0,0,0,.4); }

.smcBlockHead{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.smcBlockId{ font-size:12px; font-weight:800; letter-spacing:.1em;
  color:var(--smc-accent); padding:3px 7px; border:1px solid var(--smc-line); }
.smcBlockTitle{ font-size:16px; font-weight:700; letter-spacing:.04em; color:#fff; }
.smcBlockHint{ margin-left:auto; font-size:9px; letter-spacing:.24em;
  color:var(--smc-dim); }

.smcRow{ display:flex; align-items:center; justify-content:space-between; gap:14px;
  margin-bottom:12px; }
.smcRow--split{ margin-bottom:14px; }
.smcLabel{ font-size:10px; letter-spacing:.22em; text-transform:uppercase;
  color:var(--smc-dim); font-weight:600; }

/* Counter */
.smcCounter{ display:flex; align-items:center; gap:0;
  border:1px solid var(--smc-line); background:rgba(8,6,15,.6); }
.smcStepBtn{ width:38px; height:38px; background:transparent; border:none;
  color:var(--smc-accent); font-size:20px; cursor:pointer; font-family:inherit;
  transition:.15s; }
.smcStepBtn:hover{ background:var(--smc-glow); color:#fff; }
.smcCount{ min-width:46px; text-align:center; font-size:18px; font-weight:800;
  color:#fff; border-left:1px solid var(--smc-line);
  border-right:1px solid var(--smc-line); line-height:38px; }
.smcCounter--big .smcStepBtn{ width:46px; height:46px; font-size:24px; }
.smcCount--big{ min-width:74px; font-size:30px; line-height:46px;
  text-shadow:0 0 18px var(--smc-accent); }

/* Fields */
.smcNames{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.smcField{ display:flex; align-items:center; gap:0;
  border:1px solid var(--smc-line); background:rgba(8,6,15,.55);
  clip-path:polygon(0 0,100% 0,100% 100%,7px 100%,0 calc(100% - 7px)); }
.smcField--full{ width:100%; }
.smcFieldTag{ font-size:9px; font-weight:700; letter-spacing:.16em;
  color:var(--smc-accent); padding:0 9px; align-self:stretch;
  display:flex; align-items:center; background:rgba(154,107,255,.08);
  border-right:1px solid var(--smc-line); }
.smcInput{ flex:1; min-width:0; background:transparent; border:none; outline:none;
  color:#fff; font-size:13px; font-family:inherit; letter-spacing:.02em;
  padding:11px 12px; }
.smcInput:focus{ background:rgba(154,107,255,.06); }

/* Playlist status */
.smcStatus{ display:flex; align-items:center; gap:12px; }
.smcPill{ display:inline-flex; align-items:center; gap:7px;
  font-size:10px; font-weight:700; letter-spacing:.18em; color:#caf7d8;
  padding:6px 11px; border:1px solid rgba(80,230,150,.4);
  background:rgba(40,220,130,.08);
  clip-path:polygon(0 0,100% 0,100% 100%,6px 100%,0 calc(100% - 6px)); }
.smcPillDot{ width:7px; height:7px; border-radius:50%; background:#3fe69a;
  box-shadow:0 0 8px #3fe69a; }
.smcLogout{ background:transparent; border:none; color:var(--smc-dim);
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer;
  font-family:inherit; text-decoration:underline; text-underline-offset:3px; }
.smcLogout:hover{ color:var(--smc-accent); }
.smcSongs{ font-size:10px; letter-spacing:.18em; color:var(--smc-dim); }
.smcSongs strong{ color:#fff; font-size:14px; }

.smcActions{ display:flex; gap:10px; margin-top:12px; }
.smcBtn{ font-family:inherit; font-size:11px; font-weight:700; letter-spacing:.16em;
  text-transform:uppercase; padding:11px 18px; cursor:pointer; transition:.16s;
  clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px); }
.smcBtn--ghost{ background:rgba(154,107,255,.06); color:var(--smc-text);
  border:1px solid var(--smc-line); }
.smcBtn--ghost:hover{ border-color:var(--smc-accent);
  background:var(--smc-glow); box-shadow:0 0 18px var(--smc-glow); }

/* Footer / Start */
.smcFoot{ display:flex; align-items:center; justify-content:space-between; gap:16px;
  margin-top:22px; padding-top:18px; border-top:1px solid var(--smc-line); }
.smcFootMeta{ display:flex; align-items:center; gap:8px; font-size:10px;
  letter-spacing:.2em; color:var(--smc-dim); }
.smcStart{ position:relative; display:inline-flex; align-items:center; gap:14px;
  font-family:inherit; font-size:15px; font-weight:800; letter-spacing:.2em;
  color:#fff; cursor:pointer; padding:15px 30px;
  background:linear-gradient(100deg,var(--smc-accent2),var(--smc-accent));
  border:1px solid var(--smc-accent);
  box-shadow:0 0 26px var(--smc-glow), inset 0 0 20px rgba(255,255,255,.12);
  clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px);
  transition:.18s; }
.smcStart:hover{ box-shadow:0 0 40px var(--smc-accent),inset 0 0 24px rgba(255,255,255,.2);
  transform:translateY(-1px); }
.smcStartArrow{ font-size:14px; }

@media(max-width:560px){
  .smcSteps{ flex-direction:column; }
  .smcNames{ grid-template-columns:1fr; }
  .smcFoot{ flex-direction:column; align-items:stretch; }
  .smcStart{ justify-content:center; }
}
`
