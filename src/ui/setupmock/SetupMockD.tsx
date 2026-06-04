import { useState } from 'react'

/**
 * VISUAL-ONLY mockup — "New Game" setup screen for Hitster in a
 * cyberpunk / HUD style. No props, self-contained styles, all scoped
 * under `.sm-d`. Layout: left atmospheric RAIL + right FORM area.
 */
export default function SetupMockD() {
  const [players, setPlayers] = useState(3)
  const names = ['Anna', 'Ben', 'Cara', 'Dre', 'Eva', 'Finn']

  return (
    <div className="sm-d">
      <style>{css}</style>

      <div className="smd-frame">
        {/* ---------- LEFT RAIL ---------- */}
        <aside className="smd-rail">
          <span className="smd-slash smd-slash-tl" />
          <span className="smd-slash smd-slash-br" />

          <div className="smd-rail-top">
            <div className="smd-kicker">// NEW GAME</div>
            <div className="smd-wordmark" data-text="HITSTER">
              HITSTER
            </div>
            <div className="smd-blurb">Hear it. Place it. Hold the line.</div>
          </div>

          <div className="smd-fan">
            <div className="smd-card smd-card-1" />
            <div className="smd-card smd-card-2" />
            <div className="smd-card smd-card-3" />
            <div className="smd-fan-glow" />
          </div>

          <div className="smd-rail-foot">
            <span className="smd-dot" /> LOCAL · PASS &amp; PLAY
          </div>
        </aside>

        {/* ---------- RIGHT FORM ---------- */}
        <main className="smd-form">
          {/* Spotify status */}
          <section className="smd-section smd-section-row">
            <div>
              <div className="smd-label">Spotify</div>
              <div className="smd-pill">
                <span className="smd-pill-dot" /> PLAYER READY
              </div>
            </div>
            <button className="smd-logout">LOG OUT</button>
          </section>

          {/* Players */}
          <section className="smd-section">
            <div className="smd-label">Players</div>
            <div className="smd-stepper">
              <button
                className="smd-step-btn"
                onClick={() => setPlayers((p) => Math.max(2, p - 1))}
              >
                −
              </button>
              <div className="smd-step-val">
                {players}
                <span className="smd-step-unit">/ 6</span>
              </div>
              <button
                className="smd-step-btn"
                onClick={() => setPlayers((p) => Math.min(6, p + 1))}
              >
                +
              </button>
            </div>
            <div className="smd-names">
              {names.slice(0, players).map((n, i) => (
                <div className="smd-name" key={n}>
                  <span className="smd-name-idx">{`P${i + 1}`}</span>
                  <span className="smd-name-val">{n}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Win at */}
          <section className="smd-section">
            <div className="smd-label">Win At</div>
            <div className="smd-winrow">
              <div className="smd-win-num">10</div>
              <div className="smd-win-sub">cards to win</div>
              <div className="smd-win-track">
                <span style={{ width: '100%' }} />
              </div>
            </div>
          </section>

          {/* Playlist */}
          <section className="smd-section">
            <div className="smd-label">Playlist</div>
            <div className="smd-inputrow">
              <input
                className="smd-input"
                defaultValue="https://open.spotify.com/playlist/37i9dQ"
                placeholder="Spotify playlist link"
                readOnly
              />
              <button className="smd-import">IMPORT</button>
            </div>
            <div className="smd-pl-meta">
              <button className="smd-mine">MY PLAYLISTS</button>
              <span className="smd-count">
                <span className="smd-count-num">247</span> SONGS
              </span>
            </div>
          </section>

          {/* Start */}
          <button className="smd-start">
            <span className="smd-start-t">START GAME</span>
            <span className="smd-start-k">&#9654;</span>
          </button>
        </main>
      </div>
    </div>
  )
}

const css = `
.sm-d{
  position:fixed; inset:0; width:100vw; height:100vh;
  background:#08060f; color:#e8e2ff;
  font-family:'Segoe UI',system-ui,sans-serif;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
}
.sm-d *{box-sizing:border-box;}
.sm-d .smd-frame{
  position:relative;
  width:min(1080px,94vw); height:min(680px,92vh);
  display:grid; grid-template-columns:38% 62%;
  background:#0e0a1a;
  border:1px solid rgba(154,107,255,.30);
  box-shadow:0 0 0 1px rgba(154,107,255,.06), 0 40px 120px -20px rgba(154,107,255,.17), inset 0 0 80px rgba(107,63,214,.06);
  clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,26px 100%,0 calc(100% - 26px));
}

/* ---------- LEFT RAIL ---------- */
.sm-d .smd-rail{
  position:relative; overflow:hidden;
  padding:46px 38px;
  display:flex; flex-direction:column; justify-content:space-between;
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(154,107,255,.22), transparent 60%),
    radial-gradient(110% 80% at 0% 100%, rgba(107,63,214,.20), transparent 62%),
    linear-gradient(160deg,#160c2e 0%,#0d0820 70%,#0b0719 100%);
  border-right:1px solid rgba(154,107,255,.22);
}
.sm-d .smd-slash{position:absolute; width:54px; height:1px; background:#9a6bff; opacity:.7; box-shadow:0 0 10px #9a6bff;}
.sm-d .smd-slash-tl{top:30px; left:-12px; transform:rotate(45deg);}
.sm-d .smd-slash-br{bottom:30px; right:-12px; transform:rotate(45deg);}
.sm-d .smd-kicker{
  font-size:12px; letter-spacing:.42em; color:#b79bff; opacity:.85;
  text-transform:uppercase; margin-bottom:14px;
}
.sm-d .smd-wordmark{
  position:relative; font-weight:900; font-size:clamp(44px,6vw,72px);
  letter-spacing:.04em; line-height:.9; color:#f3eeff;
  text-shadow:0 0 26px rgba(154,107,255,.55);
}
.sm-d .smd-wordmark::after{
  content:attr(data-text); position:absolute; left:2px; top:0;
  color:transparent; -webkit-text-stroke:1px rgba(154,107,255,.35);
  opacity:.5; transform:translate(3px,3px); z-index:-1;
}
.sm-d .smd-blurb{
  margin-top:18px; font-size:14px; letter-spacing:.04em; color:#a99ccf;
  max-width:240px; line-height:1.5;
}

/* fanned cards */
.sm-d .smd-fan{position:relative; height:170px; margin:10px 0;}
.sm-d .smd-card{
  position:absolute; left:40px; bottom:10px;
  width:96px; height:134px; border-radius:8px;
  background:linear-gradient(155deg,#6b3fd6,#2a1456);
  border:1px solid rgba(154,107,255,.55);
  box-shadow:0 14px 34px -10px rgba(107,63,214,.7);
  transform-origin:bottom center;
}
.sm-d .smd-card::before{
  content:''; position:absolute; inset:8px; border-radius:5px;
  border:1px solid rgba(232,226,255,.18);
}
.sm-d .smd-card-1{transform:rotate(-18deg) translateX(-26px); background:linear-gradient(155deg,#3a1f6e,#1a0d38);}
.sm-d .smd-card-2{transform:rotate(-2deg); }
.sm-d .smd-card-3{transform:rotate(15deg) translateX(28px); background:linear-gradient(155deg,#8a5bff,#3a1f7a);}
.sm-d .smd-fan-glow{
  position:absolute; left:30px; bottom:0; width:160px; height:60px;
  background:radial-gradient(60% 100% at 50% 100%, rgba(154,107,255,.4), transparent 70%);
  filter:blur(6px);
}
.sm-d .smd-rail-foot{
  display:flex; align-items:center; gap:9px;
  font-size:11px; letter-spacing:.28em; color:#8a7caf; text-transform:uppercase;
}
.sm-d .smd-dot{width:7px; height:7px; border-radius:50%; background:#9a6bff; box-shadow:0 0 10px #9a6bff;}

/* ---------- RIGHT FORM ---------- */
.sm-d .smd-form{
  padding:42px 46px; display:flex; flex-direction:column; gap:20px;
  overflow:auto;
}
.sm-d .smd-section{
  position:relative; padding:16px 18px;
  background:rgba(15,8,32,.6);
  border:1px solid rgba(154,107,255,.18);
  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%);
}
.sm-d .smd-section-row{display:flex; align-items:center; justify-content:space-between;}
.sm-d .smd-label{
  font-size:11px; letter-spacing:.34em; text-transform:uppercase;
  color:#9a8cc4; margin-bottom:12px;
}
.sm-d .smd-section-row .smd-label{margin-bottom:8px;}

/* spotify pill */
.sm-d .smd-pill{
  display:inline-flex; align-items:center; gap:9px;
  padding:8px 16px; font-size:13px; font-weight:700; letter-spacing:.14em;
  color:#caffd9; background:rgba(38,196,120,.12);
  border:1px solid rgba(38,196,120,.5);
  clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
}
.sm-d .smd-pill-dot{width:8px; height:8px; border-radius:50%; background:#2ee07a; box-shadow:0 0 9px #2ee07a;}
.sm-d .smd-logout{
  background:none; border:none; color:#8a7caf; cursor:pointer;
  font-size:11px; letter-spacing:.22em; text-transform:uppercase;
  border-bottom:1px solid rgba(154,107,255,.3); padding:0 0 2px;
}
.sm-d .smd-logout:hover{color:#b79bff;}

/* stepper */
.sm-d .smd-stepper{display:flex; align-items:center; gap:14px;}
.sm-d .smd-step-btn{
  width:40px; height:40px; font-size:22px; color:#e8e2ff; cursor:pointer;
  background:rgba(107,63,214,.16); border:1px solid rgba(154,107,255,.4);
  clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
}
.sm-d .smd-step-btn:hover{background:rgba(154,107,255,.32); box-shadow:0 0 16px rgba(154,107,255,.4);}
.sm-d .smd-step-val{font-size:30px; font-weight:800; min-width:54px; text-align:center; color:#f3eeff;}
.sm-d .smd-step-unit{font-size:14px; color:#7d6fa6; margin-left:4px; font-weight:500;}
.sm-d .smd-names{display:flex; flex-wrap:wrap; gap:9px; margin-top:14px;}
.sm-d .smd-name{
  display:flex; align-items:center; gap:8px;
  padding:7px 13px 7px 7px; background:rgba(154,107,255,.08);
  border:1px solid rgba(154,107,255,.25);
  clip-path:polygon(5px 0,100% 0,100% 100%,0 100%,0 5px);
}
.sm-d .smd-name-idx{
  font-size:10px; font-weight:800; letter-spacing:.06em; color:#08060f;
  background:#9a6bff; padding:3px 6px; border-radius:3px;
}
.sm-d .smd-name-val{font-size:14px; color:#e8e2ff;}

/* win at */
.sm-d .smd-winrow{display:flex; align-items:center; gap:16px;}
.sm-d .smd-win-num{
  font-size:46px; font-weight:900; color:#9a6bff; line-height:1;
  text-shadow:0 0 22px rgba(154,107,255,.6);
}
.sm-d .smd-win-sub{font-size:12px; letter-spacing:.24em; text-transform:uppercase; color:#9a8cc4;}
.sm-d .smd-win-track{flex:1; height:6px; background:rgba(154,107,255,.12); border:1px solid rgba(154,107,255,.2); overflow:hidden;}
.sm-d .smd-win-track span{display:block; height:100%; background:linear-gradient(90deg,#6b3fd6,#9a6bff); box-shadow:0 0 12px rgba(154,107,255,.6);}

/* playlist */
.sm-d .smd-inputrow{display:flex; gap:10px;}
.sm-d .smd-input{
  flex:1; padding:12px 14px; font-size:13px; color:#d8d0ff;
  background:rgba(8,6,15,.7); border:1px solid rgba(154,107,255,.3);
  letter-spacing:.02em; outline:none;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
}
.sm-d .smd-input:focus{border-color:#9a6bff; box-shadow:0 0 16px rgba(154,107,255,.25);}
.sm-d .smd-import{
  padding:0 20px; font-size:12px; font-weight:800; letter-spacing:.18em;
  color:#08060f; background:#9a6bff; border:none; cursor:pointer;
  box-shadow:0 0 18px rgba(154,107,255,.4);
  clip-path:polygon(8px 0,100% 0,100% 100%,0 100%,0 8px);
}
.sm-d .smd-import:hover{background:#b79bff;}
.sm-d .smd-pl-meta{display:flex; align-items:center; justify-content:space-between; margin-top:12px;}
.sm-d .smd-mine{
  background:none; border:1px solid rgba(154,107,255,.3); color:#b79bff;
  padding:6px 14px; font-size:11px; letter-spacing:.18em; cursor:pointer;
  clip-path:polygon(5px 0,100% 0,100% 100%,0 100%,0 5px);
}
.sm-d .smd-mine:hover{background:rgba(154,107,255,.14);}
.sm-d .smd-count{font-size:12px; letter-spacing:.2em; color:#8a7caf;}
.sm-d .smd-count-num{color:#9a6bff; font-weight:800; font-size:15px;}

/* start */
.sm-d .smd-start{
  margin-top:auto; display:flex; align-items:center; justify-content:center; gap:14px;
  padding:18px; font-size:18px; font-weight:900; letter-spacing:.26em;
  color:#08060f; cursor:pointer; border:none;
  background:linear-gradient(100deg,#9a6bff,#6b3fd6);
  box-shadow:0 0 34px rgba(154,107,255,.5), inset 0 0 20px rgba(255,255,255,.12);
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
}
.sm-d .smd-start:hover{background:linear-gradient(100deg,#b79bff,#7d4ce0); box-shadow:0 0 48px rgba(154,107,255,.7);}
.sm-d .smd-start-k{font-size:13px; color:#1a0d38;}
`
