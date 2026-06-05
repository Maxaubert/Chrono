import { useState } from 'react'

/**
 * SetupMockA — VISUAL-ONLY cyberpunk/HUD mockup of the Hitster "New Game" setup
 * screen. Centered angular HUD panel. No real logic, no props. All CSS scoped
 * under `.sm-a`.
 */
export default function SetupMockA() {
  const [count, setCount] = useState(3)
  const [names, setNames] = useState(['Anna', 'Ben', 'Cara'])
  const [winAt, setWinAt] = useState(10)
  const [playlist, setPlaylist] = useState('')

  const setName = (i: number, v: string) =>
    setNames((prev) => prev.map((n, idx) => (idx === i ? v : n)))

  // Keep the visible name rows in sync with the count (visual only).
  const visibleNames = Array.from({ length: count }, (_, i) => names[i] ?? '')

  return (
    <div className="sm-a">
      <style>{`
        .sm-a {
          --sma-bg: #08060f;
          --sma-accent: #9a6bff;
          --sma-accent-2: #6b3fd6;
          --sma-ink: #0f0820;
          --sma-panel: #0e0a1a;
          --sma-glow: rgba(154,107,255,.17);
          --sma-line: rgba(154,107,255,.28);
          --sma-text: #cfc6e8;
          --sma-dim: #7d7298;
          --sma-green: #46e6a0;

          position: relative;
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background:
            radial-gradient(1100px 700px at 50% -10%, rgba(107,63,214,.22), transparent 60%),
            radial-gradient(800px 600px at 90% 110%, rgba(154,107,255,.12), transparent 60%),
            var(--sma-bg);
          color: var(--sma-text);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
        .sm-a *,
        .sm-a *::before,
        .sm-a *::after { box-sizing: border-box; }

        /* faint grid + grain backdrop */
        .sm-a .sma-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(154,107,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(154,107,255,.05) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 78%);
          z-index: 0;
        }
        .sm-a .sma-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .04;
          z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ===== HUD PANEL ===== */
        .sm-a .sma-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 540px;
          background:
            linear-gradient(180deg, rgba(20,12,38,.92), rgba(12,8,24,.96));
          border: 1px solid var(--sma-line);
          clip-path: polygon(
            22px 0, calc(100% - 22px) 0, 100% 22px,
            100% calc(100% - 22px), calc(100% - 22px) 100%,
            22px 100%, 0 calc(100% - 22px), 0 22px
          );
          padding: 30px 32px 34px;
          box-shadow:
            0 0 0 1px rgba(0,0,0,.4),
            0 24px 80px rgba(0,0,0,.6),
            0 0 90px var(--sma-glow) inset;
        }
        /* corner ticks */
        .sm-a .sma-panel::before,
        .sm-a .sma-panel::after {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
          border: 1px solid var(--sma-accent);
          opacity: .7;
        }
        .sm-a .sma-panel::before { top: 7px; left: 7px; border-right: 0; border-bottom: 0; }
        .sm-a .sma-panel::after { bottom: 7px; right: 7px; border-left: 0; border-top: 0; }

        /* ===== HEADER ===== */
        .sm-a .sma-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .sm-a .sma-wordmark {
          font-weight: 800;
          font-size: 30px;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: #fff;
          line-height: 1;
          text-shadow: 0 0 22px var(--sma-glow);
        }
        .sm-a .sma-wordmark span { color: var(--sma-accent); }
        .sm-a .sma-kicker {
          margin-top: 8px;
          font-size: 11px;
          letter-spacing: .42em;
          text-transform: uppercase;
          color: var(--sma-dim);
          font-weight: 700;
        }

        /* spotify status pill */
        .sm-a .sma-status { text-align: right; }
        .sm-a .sma-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--sma-green);
          background: rgba(70,230,160,.07);
          border: 1px solid rgba(70,230,160,.35);
          clip-path: polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
        }
        .sm-a .sma-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--sma-green);
          box-shadow: 0 0 10px var(--sma-green);
          animation: smaPulse 1.8s ease-in-out infinite;
        }
        @keyframes smaPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .55; transform: scale(.82); }
        }
        .sm-a .sma-logout {
          display: block;
          margin-top: 8px;
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--sma-dim);
          text-decoration: none;
          cursor: pointer;
        }
        .sm-a .sma-logout:hover { color: var(--sma-accent); }

        /* ===== SECTIONS ===== */
        .sm-a .sma-section { margin-top: 22px; }
        .sm-a .sma-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: var(--sma-accent);
          margin-bottom: 12px;
        }
        .sm-a .sma-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--sma-line), transparent);
        }
        .sm-a .sma-sub {
          font-size: 9.5px;
          letter-spacing: .14em;
          color: var(--sma-dim);
          font-weight: 600;
        }

        /* generic HUD input */
        .sm-a .sma-input {
          width: 100%;
          background: rgba(8,5,18,.85);
          border: 1px solid var(--sma-line);
          color: var(--sma-text);
          font-size: 14px;
          letter-spacing: .04em;
          padding: 11px 13px;
          outline: none;
          clip-path: polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px);
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .sm-a .sma-input::placeholder { color: var(--sma-dim); }
        .sm-a .sma-input:focus {
          border-color: var(--sma-accent);
          background: rgba(20,12,38,.9);
          box-shadow: 0 0 0 1px var(--sma-accent), 0 0 18px var(--sma-glow);
        }

        /* count stepper */
        .sm-a .sma-count {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .sm-a .sma-count-btn {
          flex: 1;
          padding: 10px 0;
          font-weight: 800;
          font-size: 15px;
          color: var(--sma-dim);
          background: rgba(8,5,18,.7);
          border: 1px solid var(--sma-line);
          cursor: pointer;
          clip-path: polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
          transition: all .14s;
        }
        .sm-a .sma-count-btn:hover { color: var(--sma-text); border-color: var(--sma-accent); }
        .sm-a .sma-count-btn.is-on {
          color: #fff;
          background: linear-gradient(180deg, var(--sma-accent), var(--sma-accent-2));
          border-color: var(--sma-accent);
          box-shadow: 0 0 18px var(--sma-glow);
        }

        /* player name rows */
        .sm-a .sma-players { display: grid; gap: 8px; }
        .sm-a .sma-prow {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sm-a .sma-pnum {
          flex: none;
          width: 30px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          color: var(--sma-accent);
          background: rgba(154,107,255,.08);
          border: 1px solid var(--sma-line);
          clip-path: polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px);
        }

        /* two-up row (win-at) */
        .sm-a .sma-winrow { display: flex; align-items: flex-end; gap: 14px; }
        .sm-a .sma-num {
          width: 92px;
          text-align: center;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: .08em;
          padding: 9px 8px;
        }
        .sm-a .sma-winhint {
          padding-bottom: 11px;
          font-size: 10px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--sma-dim);
          font-weight: 700;
        }

        /* playlist block */
        .sm-a .sma-plrow { display: flex; gap: 8px; }
        .sm-a .sma-plrow .sma-input { flex: 1; }
        .sm-a .sma-btn {
          flex: none;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--sma-accent);
          background: rgba(154,107,255,.08);
          border: 1px solid var(--sma-accent);
          cursor: pointer;
          clip-path: polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px);
          transition: all .14s;
        }
        .sm-a .sma-btn:hover {
          color: #fff;
          background: var(--sma-accent);
          box-shadow: 0 0 18px var(--sma-glow);
        }
        .sm-a .sma-plactions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
        }
        .sm-a .sma-ghost {
          padding: 9px 14px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--sma-text);
          background: transparent;
          border: 1px solid var(--sma-line);
          cursor: pointer;
          clip-path: polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
          transition: all .14s;
        }
        .sm-a .sma-ghost:hover { border-color: var(--sma-accent); color: var(--sma-accent); }
        .sm-a .sma-loaded {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--sma-green);
        }
        .sm-a .sma-loaded .sma-dot { animation: none; }

        /* ===== START BUTTON ===== */
        .sm-a .sma-start {
          position: relative;
          width: 100%;
          margin-top: 30px;
          padding: 18px 0;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: .34em;
          text-transform: uppercase;
          color: #fff;
          cursor: pointer;
          border: 1px solid var(--sma-accent);
          background: linear-gradient(180deg, var(--sma-accent), var(--sma-accent-2));
          clip-path: polygon(14px 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,14px 100%,0 50%);
          box-shadow: 0 0 26px var(--sma-glow), 0 0 60px var(--sma-glow);
          text-shadow: 0 0 14px rgba(0,0,0,.4);
          animation: smaBreathe 2.6s ease-in-out infinite;
          transition: transform .12s;
        }
        .sm-a .sma-start:hover { transform: translateY(-1px); }
        .sm-a .sma-start:active { transform: translateY(1px); }
        @keyframes smaBreathe {
          0%, 100% { box-shadow: 0 0 22px var(--sma-glow), 0 0 50px var(--sma-glow); }
          50% { box-shadow: 0 0 34px rgba(154,107,255,.35), 0 0 80px rgba(154,107,255,.28); }
        }
        .sm-a .sma-foot {
          margin-top: 12px;
          text-align: center;
          font-size: 9.5px;
          letter-spacing: .34em;
          text-transform: uppercase;
          color: var(--sma-dim);
        }
      `}</style>

      <div className="sma-grid" />
      <div className="sma-grain" />

      <div className="sma-panel">
        {/* HEADER */}
        <div className="sma-head">
          <div>
            <div className="sma-wordmark">
              HIT<span>STER</span>
            </div>
            <div className="sma-kicker">// New Game</div>
          </div>
          <div className="sma-status">
            <span className="sma-pill">
              <span className="sma-dot" />
              Player Ready
            </span>
            <a className="sma-logout">Log out</a>
          </div>
        </div>

        {/* PLAYERS */}
        <div className="sma-section">
          <div className="sma-label">
            Players <span className="sma-sub">2–6</span>
          </div>
          <div className="sma-count">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={`sma-count-btn${count === n ? ' is-on' : ''}`}
                onClick={() => setCount(n)}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
          <div className="sma-players">
            {visibleNames.map((name, i) => (
              <div className="sma-prow" key={i}>
                <span className="sma-pnum">P{i + 1}</span>
                <input
                  className="sma-input"
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* WIN AT */}
        <div className="sma-section">
          <div className="sma-label">Win At</div>
          <div className="sma-winrow">
            <input
              className="sma-input sma-num"
              value={winAt}
              onChange={(e) => setWinAt(Number(e.target.value) || 0)}
              inputMode="numeric"
            />
            <span className="sma-winhint">cards to win</span>
          </div>
        </div>

        {/* PLAYLIST */}
        <div className="sma-section">
          <div className="sma-label">Playlist</div>
          <div className="sma-plrow">
            <input
              className="sma-input"
              value={playlist}
              onChange={(e) => setPlaylist(e.target.value)}
              placeholder="Spotify playlist link"
            />
            <button className="sma-btn" type="button">
              Import
            </button>
          </div>
          <div className="sma-plactions">
            <button className="sma-ghost" type="button">
              My Playlists
            </button>
            <span className="sma-loaded">
              <span className="sma-dot" />
              247 songs
            </span>
          </div>
        </div>

        {/* START */}
        <button className="sma-start" type="button">
          Start Game
        </button>
        <div className="sma-foot">All systems nominal</div>
      </div>
    </div>
  )
}
