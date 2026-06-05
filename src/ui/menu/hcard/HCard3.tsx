export default function HCard3() {
  return (
    <div className="hc3">
      <style>{`
        .hc3 {
          --hc3-gold: #cda349;
          --hc3-sage: #8a9a6b;
          --hc3-dark: #14140c;
          --hc3-darker: #0e0a07;
          --hc3-cream: #f3ecd6;
          display: inline-block;
          width: 300px;
          height: 420px;
          perspective: 1200px;
        }

        .hc3 *,
        .hc3 *::before,
        .hc3 *::after {
          box-sizing: border-box;
          margin: 0;
        }

        .hc3-card {
          position: relative;
          width: 300px;
          height: 420px;
          border-radius: 16px;
          overflow: hidden;
          background: var(--hc3-darker);
          border: 1px solid var(--hc3-gold);
          box-shadow:
            0 0 0 1px rgba(243, 236, 214, 0.06),
            0 24px 60px -18px rgba(0, 0, 0, 0.85),
            0 6px 20px -8px rgba(0, 0, 0, 0.6);
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
          isolation: isolate;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.5s ease;
        }

        .hc3-card:hover {
          transform: translateY(-6px) rotateX(3deg);
          box-shadow:
            0 0 0 1px rgba(205, 163, 73, 0.4),
            0 36px 80px -20px rgba(0, 0, 0, 0.9),
            0 10px 28px -10px rgba(0, 0, 0, 0.7);
        }

        /* ---------- Full-bleed artwork ---------- */
        .hc3-art {
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(120% 90% at 50% 18%, #6e3a14 0%, #3a1f0c 38%, var(--hc3-dark) 72%, var(--hc3-darker) 100%);
        }

        .hc3-artSvg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .hc3-icon {
          position: absolute;
          left: 50%;
          top: 40%;
          transform: translate(-50%, -50%);
          font-size: 150px;
          line-height: 1;
          filter: blur(0.4px) drop-shadow(0 0 38px rgba(255, 150, 60, 0.55));
          opacity: 0.92;
          animation: hc3-flicker 4.5s ease-in-out infinite;
        }

        .hc3-iconGlow {
          position: absolute;
          left: 50%;
          top: 40%;
          width: 220px;
          height: 220px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255, 140, 40, 0.45) 0%, rgba(205, 80, 20, 0.18) 45%, transparent 70%);
          filter: blur(6px);
          animation: hc3-pulse 4.5s ease-in-out infinite;
        }

        @keyframes hc3-flicker {
          0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
          45% { opacity: 0.78; transform: translate(-50%, -51%) scale(1.015); }
          70% { opacity: 0.96; transform: translate(-50%, -49.5%) scale(0.995); }
        }

        @keyframes hc3-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        /* ---------- Top light vignette + edge vignette ---------- */
        .hc3-topLight {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(140% 70% at 50% -12%, rgba(243, 236, 214, 0.22) 0%, rgba(243, 236, 214, 0.05) 30%, transparent 55%);
          pointer-events: none;
        }

        .hc3-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            radial-gradient(110% 110% at 50% 42%, transparent 55%, rgba(8, 6, 3, 0.55) 100%);
          pointer-events: none;
        }

        /* ---------- Film grain ---------- */
        .hc3-grain {
          position: absolute;
          inset: -50%;
          z-index: 3;
          opacity: 0.07;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          animation: hc3-grainShift 0.6s steps(3) infinite;
          mix-blend-mode: overlay;
        }

        @keyframes hc3-grainShift {
          0% { transform: translate(0, 0); }
          33% { transform: translate(-4%, 3%); }
          66% { transform: translate(3%, -2%); }
          100% { transform: translate(0, 0); }
        }

        /* ---------- Gold inner frame ---------- */
        .hc3-frame {
          position: absolute;
          inset: 9px;
          z-index: 5;
          border: 1px solid rgba(205, 163, 73, 0.55);
          border-radius: 10px;
          pointer-events: none;
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.4);
        }

        /* ---------- Dramatic vertical YEAR ---------- */
        .hc3-year {
          position: absolute;
          top: 16px;
          right: 12px;
          z-index: 6;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 58px;
          font-weight: 700;
          letter-spacing: 2px;
          line-height: 0.9;
          color: var(--hc3-cream);
          text-shadow:
            0 0 1px rgba(205, 163, 73, 0.9),
            0 2px 18px rgba(0, 0, 0, 0.85);
          font-feature-settings: "lnum" 1;
        }

        .hc3-year::after {
          content: "";
          position: absolute;
          left: -10px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: linear-gradient(var(--hc3-gold), transparent);
          opacity: 0.65;
        }

        /* ---------- Bottom scrim + text block ---------- */
        .hc3-scrim {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 6;
          padding: 60px 22px 22px;
          background: linear-gradient(
            to top,
            rgba(8, 6, 3, 0.96) 0%,
            rgba(12, 9, 5, 0.85) 38%,
            rgba(14, 14, 12, 0.35) 72%,
            transparent 100%
          );
        }

        .hc3-label {
          display: block;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-variant: small-caps;
          text-transform: lowercase;
          letter-spacing: 0.28em;
          font-size: 11px;
          font-weight: 600;
          color: var(--hc3-sage);
          margin-bottom: 8px;
        }

        .hc3-label .hc3-dot {
          color: var(--hc3-gold);
          margin: 0 6px;
        }

        .hc3-title {
          font-size: 40px;
          font-weight: 600;
          line-height: 1;
          color: var(--hc3-cream);
          letter-spacing: 0.5px;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.8);
        }

        .hc3-rule {
          width: 46px;
          height: 2px;
          margin: 12px 0 10px;
          background: linear-gradient(90deg, var(--hc3-gold), transparent);
        }

        .hc3-flavor {
          font-size: 13.5px;
          font-style: italic;
          line-height: 1.45;
          color: rgba(243, 236, 214, 0.82);
          letter-spacing: 0.2px;
        }
      `}</style>

      <article className="hc3-card" aria-label="Revolution, France, 1789">
        <div className="hc3-art">
          <svg
            className="hc3-artSvg"
            viewBox="0 0 300 420"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hc3-haze" cx="50%" cy="36%" r="62%">
                <stop offset="0%" stopColor="#ffb25a" stopOpacity="0.4" />
                <stop offset="42%" stopColor="#b9541a" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0e0a07" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hc3-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a1a0c" stopOpacity="0" />
                <stop offset="100%" stopColor="#0e0a07" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <rect width="300" height="420" fill="url(#hc3-haze)" />
            {/* atmospheric embers */}
            <g fill="#ffcf8a" opacity="0.5">
              <circle cx="92" cy="118" r="1.6" />
              <circle cx="210" cy="92" r="1.2" />
              <circle cx="148" cy="70" r="1.8" />
              <circle cx="64" cy="186" r="1.1" />
              <circle cx="236" cy="160" r="1.5" />
              <circle cx="118" cy="232" r="1.3" />
              <circle cx="188" cy="210" r="1" />
            </g>
            <rect y="240" width="300" height="180" fill="url(#hc3-floor)" />
          </svg>
          <div className="hc3-iconGlow" aria-hidden="true" />
          <div className="hc3-icon" aria-hidden="true">
            🔥
          </div>
        </div>

        <div className="hc3-topLight" />
        <div className="hc3-vignette" />
        <div className="hc3-grain" />
        <div className="hc3-frame" />

        <div className="hc3-year">1789</div>

        <div className="hc3-scrim">
          <span className="hc3-label">
            Age of Revolutions <span className="hc3-dot">◆</span> France
          </span>
          <h2 className="hc3-title">Revolution</h2>
          <div className="hc3-rule" />
          <p className="hc3-flavor">Liberté, égalité, fraternité.</p>
        </div>
      </article>
    </div>
  )
}
