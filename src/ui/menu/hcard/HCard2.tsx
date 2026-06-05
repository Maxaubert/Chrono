export default function HCard2() {
  return (
    <div className="hc2">
      <style>{`
        .hc2 {
          --hc2-gold: #cda349;
          --hc2-gold-bright: #e6cb86;
          --hc2-sage: #8a9a6b;
          --hc2-dark: #14140c;
          --hc2-dark2: #1a1f16;
          --hc2-cream: #f3ecd6;
          width: 300px;
          height: 420px;
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--hc2-dark);
          -webkit-font-smoothing: antialiased;
          user-select: none;
        }
        .hc2 *,
        .hc2 *::before,
        .hc2 *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* ---- outer card ---- */
        .hc2-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 14px;
          padding: 7px;
          background:
            linear-gradient(160deg, #2a2c1c 0%, #14140c 45%, #20231a 100%);
          box-shadow:
            0 18px 40px -12px rgba(0,0,0,0.7),
            0 2px 4px rgba(0,0,0,0.5),
            inset 0 0 0 1px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        /* ornate beveled gold border */
        .hc2-frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          padding: 8px 9px 9px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          background:
            linear-gradient(150deg, #20231a 0%, #14140c 60%, #1a1f16 100%);
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow:
            inset 0 0 0 1px rgba(0,0,0,0.7),
            inset 0 0 22px rgba(0,0,0,0.65);
        }
        .hc2-frame::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 8px;
          padding: 2px;
          background:
            linear-gradient(135deg,
              var(--hc2-gold-bright) 0%,
              var(--hc2-gold) 25%,
              #7c5f22 50%,
              var(--hc2-gold) 72%,
              var(--hc2-gold-bright) 100%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* ---- generic ornate plate (title / type / text panels) ---- */
        .hc2-plate {
          position: relative;
          border-radius: 4px;
          background:
            linear-gradient(180deg, #f7f2e0 0%, #e7dcbe 100%);
          border: 1px solid #b9933f;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.7),
            inset 0 -2px 4px rgba(120,95,34,0.25),
            0 1px 2px rgba(0,0,0,0.45);
        }

        /* ---- title bar ---- */
        .hc2-title {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          min-height: 30px;
        }
        .hc2-title-name {
          flex: 1;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hc2-era {
          flex: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 700;
          color: #2a2410;
          background:
            radial-gradient(circle at 32% 28%, var(--hc2-gold-bright), var(--hc2-gold) 55%, #8a6a23 100%);
          box-shadow:
            inset 0 1px 1px rgba(255,255,255,0.6),
            inset 0 -2px 3px rgba(0,0,0,0.35),
            0 1px 2px rgba(0,0,0,0.5);
        }

        /* ---- art window ---- */
        .hc2-art {
          position: relative;
          flex: none;
          height: 168px;
          border-radius: 3px;
          overflow: hidden;
          border: 3px solid #1d1d11;
          box-shadow:
            inset 0 0 0 1px var(--hc2-gold),
            inset 0 0 30px rgba(0,0,0,0.55),
            0 1px 2px rgba(0,0,0,0.5);
          background:
            radial-gradient(120% 90% at 50% 18%, #b06a32 0%, #7c4a24 38%, #3a2613 78%, #1c1208 100%);
        }
        .hc2-art::after {
          /* vignette */
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(75% 65% at 50% 42%, transparent 55%, rgba(0,0,0,0.55) 100%);
          pointer-events: none;
        }
        .hc2-art-texture {
          position: absolute;
          inset: 0;
          opacity: 0.16;
          mix-blend-mode: overlay;
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 5px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 6px);
        }
        .hc2-art-glow {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          z-index: 1;
        }
        .hc2-art-glow::before {
          content: '';
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(243,236,214,0.55) 0%, rgba(205,163,73,0.18) 45%, transparent 70%);
          animation: hc2pulse 5s ease-in-out infinite;
        }
        .hc2-icon {
          position: relative;
          font-size: 92px;
          line-height: 1;
          filter: drop-shadow(0 6px 8px rgba(0,0,0,0.55));
          animation: hc2bob 6s ease-in-out infinite;
        }
        .hc2-art-place {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          padding: 10px 8px 5px;
          font-size: 11px;
          font-style: italic;
          letter-spacing: 0.4px;
          color: var(--hc2-cream);
          text-align: center;
          text-shadow: 0 1px 3px rgba(0,0,0,0.9);
          background: linear-gradient(180deg, transparent, rgba(0,0,0,0.55));
        }
        @keyframes hc2bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes hc2pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.75; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        /* ---- type line ---- */
        .hc2-typeline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 9px;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          min-height: 24px;
        }
        .hc2-set {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .hc2-rarity { color: #8a6a23; }

        /* ---- text box ---- */
        .hc2-textbox {
          flex: 1;
          padding: 9px 11px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          line-height: 1.35;
        }
        .hc2-rules {
          color: #2a2410;
        }
        .hc2-rules b { color: #6e5417; }
        .hc2-divider {
          height: 0;
          border: none;
          border-top: 1px solid rgba(138,106,35,0.55);
          box-shadow: 0 1px 0 rgba(255,255,255,0.6);
          margin: 1px 4px;
        }
        .hc2-flavor {
          font-style: italic;
          color: #4a4126;
          font-size: 12px;
          line-height: 1.3;
        }

        /* ---- year stat (power/toughness box) ---- */
        .hc2-year {
          position: absolute;
          right: 8px;
          bottom: 7px;
          z-index: 3;
          min-width: 56px;
          padding: 3px 9px 4px;
          text-align: center;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.5px;
          color: #2a2410;
          border-radius: 5px 5px 4px 4px;
          background:
            linear-gradient(180deg, #f7f2e0 0%, #e2d3ac 100%);
          border: 2px solid #1d1d11;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.7),
            inset 0 0 0 1px var(--hc2-gold),
            0 2px 4px rgba(0,0,0,0.5);
        }
        .hc2-year small {
          display: block;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7c5f22;
          margin-bottom: -1px;
        }
      `}</style>

      <div className="hc2-card">
        <div className="hc2-frame">
          {/* Title bar */}
          <div className="hc2-plate hc2-title">
            <span className="hc2-title-name">New World</span>
            <span className="hc2-era" title="Era of Exploration">
              ✦
            </span>
          </div>

          {/* Art window */}
          <div className="hc2-art">
            <div className="hc2-art-texture" />
            <div className="hc2-art-glow">
              <span className="hc2-icon" role="img" aria-label="sailing ship">
                ⛵
              </span>
            </div>
            <div className="hc2-art-place">Atlantic Crossing</div>
          </div>

          {/* Type line */}
          <div className="hc2-plate hc2-typeline">
            <span>Discovery — Voyage</span>
            <span className="hc2-set hc2-rarity" title="Rarity">
              ◆ M
            </span>
          </div>

          {/* Text box */}
          <div className="hc2-plate hc2-textbox">
            <p className="hc2-rules">
              <b>Place</b> on your timeline by year. If correct, keep the card.
            </p>
            <hr className="hc2-divider" />
            <p className="hc2-flavor">A voyage that redrew the map.</p>
          </div>

          {/* Year stat box */}
          <div className="hc2-year">
            <small>YEAR</small>
            1492
          </div>
        </div>
      </div>
    </div>
  )
}
