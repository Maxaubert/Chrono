export default function HCard5() {
  return (
    <div className="hc5">
      <style>{`
        .hc5 {
          --hc5-gold: #cda349;
          --hc5-sage: #8a9a6b;
          --hc5-dark: #121009;
          --hc5-dark2: #1a1710;
          --hc5-cream: #f3ecd6;
          display: inline-block;
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
        }

        .hc5 .hc5-card {
          position: relative;
          width: 300px;
          height: 420px;
          box-sizing: border-box;
          padding: 30px 28px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 14px;
          background:
            radial-gradient(120% 80% at 50% -10%, rgba(205,163,73,0.10), transparent 60%),
            linear-gradient(160deg, var(--hc5-dark2) 0%, var(--hc5-dark) 100%);
          border: 1px solid rgba(205,163,73,0.28);
          box-shadow:
            0 18px 50px rgba(0,0,0,0.55),
            inset 0 0 0 1px rgba(243,236,214,0.03);
          color: var(--hc5-cream);
          overflow: hidden;
        }

        /* fine inner hairline frame */
        .hc5 .hc5-frame {
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(205,163,73,0.16);
          border-radius: 8px;
          pointer-events: none;
        }

        .hc5 .hc5-era {
          font-size: 9px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--hc5-sage);
          margin: 4px 0 0;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-weight: 600;
        }

        .hc5 .hc5-rule {
          width: 64px;
          height: 1px;
          margin: 16px 0;
          background: linear-gradient(90deg, transparent, var(--hc5-gold), transparent);
          opacity: 0.7;
        }

        /* circular art medallion */
        .hc5 .hc5-medallion {
          position: relative;
          width: 92px;
          height: 92px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 2px 0 4px;
          background:
            radial-gradient(circle at 50% 38%, rgba(205,163,73,0.14), rgba(18,16,9,0.9) 72%);
          box-shadow:
            inset 0 2px 8px rgba(0,0,0,0.6),
            inset 0 0 0 1px rgba(243,236,214,0.04),
            0 2px 10px rgba(0,0,0,0.4);
        }

        .hc5 .hc5-ring {
          position: absolute;
          inset: 0;
          color: var(--hc5-gold);
        }

        .hc5 .hc5-icon {
          font-size: 36px;
          line-height: 1;
          filter:
            drop-shadow(0 1px 1px rgba(0,0,0,0.5))
            sepia(0.5) saturate(1.1) hue-rotate(-8deg);
        }

        .hc5 .hc5-year {
          font-size: 76px;
          line-height: 0.92;
          font-weight: 200;
          letter-spacing: 0.02em;
          color: var(--hc5-cream);
          margin: 0;
          font-variant-numeric: lining-nums;
        }

        .hc5 .hc5-title {
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 0.01em;
          color: var(--hc5-gold);
          margin: 10px 0 0;
          text-align: center;
          line-height: 1.1;
        }

        .hc5 .hc5-place {
          font-size: 9px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(243,236,214,0.55);
          margin: 8px 0 0;
          font-family: "Helvetica Neue", Arial, sans-serif;
        }

        .hc5 .hc5-flavor {
          font-style: italic;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(243,236,214,0.78);
          text-align: center;
          margin: 0;
          max-width: 200px;
        }

        .hc5 .hc5-spacer { flex: 1; }
      `}</style>

      <div className="hc5-card">
        <div className="hc5-frame" />

        <p className="hc5-era">The Modern Age</p>

        <div className="hc5-rule" />

        <div className="hc5-medallion">
          <svg
            className="hc5-ring"
            viewBox="0 0 92 92"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="46"
              cy="46"
              r="44"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.85"
            />
            <circle
              cx="46"
              cy="46"
              r="39"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.45"
            />
          </svg>
          <span className="hc5-icon" role="img" aria-label="First Flight">
            ✈️
          </span>
        </div>

        <h1 className="hc5-year">1903</h1>

        <h2 className="hc5-title">First Flight</h2>

        <p className="hc5-place">Kitty Hawk · USA</p>

        <div className="hc5-rule" />

        <p className="hc5-flavor">Twelve seconds that changed travel.</p>

        <div className="hc5-spacer" />
      </div>
    </div>
  )
}
