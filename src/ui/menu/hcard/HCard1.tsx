export default function HCard1() {
  return (
    <div className="hc1">
      <style>{`
        .hc1 {
          --hc1-gold: #cda349;
          --hc1-gold-lite: #e9d79a;
          --hc1-gold-deep: #8a6d28;
          --hc1-sage: #8a9a6b;
          --hc1-dark: #14140c;
          --hc1-dark2: #1a1f16;
          --hc1-cream: #f3ecd6;

          position: relative;
          width: 300px;
          height: 420px;
          border-radius: 20px;
          padding: 14px;
          box-sizing: border-box;
          font-family: Georgia, "Times New Roman", serif;
          color: var(--hc1-dark);
          background:
            linear-gradient(135deg, var(--hc1-gold-lite) 0%, var(--hc1-gold) 28%, var(--hc1-gold-deep) 60%, var(--hc1-gold) 86%, var(--hc1-gold-lite) 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.5) inset,
            0 0 0 1px rgba(0,0,0,0.25),
            0 18px 40px -12px rgba(0,0,0,0.6),
            0 6px 14px -6px rgba(0,0,0,0.5);
          user-select: none;
          isolation: isolate;
        }

        /* ornate inner bevel of the outer frame */
        .hc1__frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          padding: 10px;
          box-sizing: border-box;
          background:
            radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.18), transparent 55%),
            linear-gradient(160deg, var(--hc1-dark2), var(--hc1-dark));
          border: 2px solid rgba(20,20,12,0.55);
          box-shadow:
            0 0 0 2px var(--hc1-gold-lite) inset,
            0 0 0 4px rgba(0,0,0,0.35) inset;
          display: flex;
          flex-direction: column;
        }

        /* holographic sheen sweeping the whole card */
        .hc1__holo {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.35;
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255,255,255,0.5) 45%,
            rgba(140,154,107,0.5) 50%,
            rgba(205,163,73,0.5) 55%,
            transparent 70%
          );
          background-size: 250% 250%;
          animation: hc1Sheen 6s linear infinite;
          z-index: 6;
        }
        @keyframes hc1Sheen {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        /* name banner across the top of the art */
        .hc1__banner {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 8px 8px 4px 4px;
          background:
            linear-gradient(180deg, var(--hc1-gold-lite), var(--hc1-gold) 55%, var(--hc1-gold-deep));
          border: 1px solid rgba(20,20,12,0.5);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.6) inset,
            0 2px 6px rgba(0,0,0,0.45);
        }
        .hc1__title {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: var(--hc1-dark);
          text-shadow: 0 1px 0 rgba(255,255,255,0.45);
          line-height: 1.05;
        }
        .hc1__star {
          font-size: 13px;
          color: var(--hc1-dark2);
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
          flex-shrink: 0;
        }

        /* art window */
        .hc1__art {
          position: relative;
          margin-top: 8px;
          height: 200px;
          border-radius: 6px;
          overflow: hidden;
          border: 3px solid var(--hc1-gold);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.6),
            0 6px 14px -6px rgba(0,0,0,0.7) inset;
          background:
            radial-gradient(120% 90% at 50% 18%, #6a5a2e 0%, #3a3416 45%, #14140c 100%);
        }
        /* faint texture + soft vignette over the art */
        .hc1__art::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(243,236,214,0.06) 1px, transparent 1.4px);
          background-size: 8px 8px;
          opacity: 0.7;
        }
        .hc1__art::after {
          content: "";
          position: absolute;
          inset: 0;
          box-shadow: 0 0 60px 18px rgba(0,0,0,0.7) inset;
        }
        /* real artwork goes here — placeholder icon below */
        .hc1__icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 96px;
          line-height: 1;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.6));
          z-index: 2;
        }

        /* era / type strip */
        .hc1__era {
          position: relative;
          z-index: 3;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--hc1-cream);
          background: linear-gradient(90deg, rgba(138,154,107,0.5), rgba(138,154,107,0.12));
          border-left: 3px solid var(--hc1-sage);
          border-radius: 3px;
        }
        .hc1__era b { color: var(--hc1-gold-lite); font-weight: 700; }

        /* lower text box */
        .hc1__box {
          position: relative;
          z-index: 3;
          margin-top: 8px;
          flex: 1;
          padding: 10px 12px;
          border-radius: 6px;
          color: var(--hc1-dark);
          background: linear-gradient(180deg, var(--hc1-cream), #e6dcbf);
          border: 1px solid var(--hc1-gold-deep);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.7) inset,
            0 4px 10px -6px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .hc1__flavor {
          margin: 0;
          font-style: italic;
          font-size: 14px;
          line-height: 1.35;
          color: #2b2a1c;
        }
        .hc1__place {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--hc1-gold-deep);
          font-weight: 700;
          border-top: 1px solid rgba(138,109,40,0.35);
          padding-top: 6px;
        }

        /* year gem badge — the headline stat */
        .hc1__year {
          position: absolute;
          top: 6px;
          right: 6px;
          z-index: 7;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 32% 28%, #fff7df 0%, var(--hc1-gold-lite) 22%, var(--hc1-gold) 55%, var(--hc1-gold-deep) 100%);
          border: 2px solid var(--hc1-dark);
          box-shadow:
            0 0 0 2px var(--hc1-gold-lite),
            0 4px 10px rgba(0,0,0,0.55),
            0 1px 2px rgba(255,255,255,0.8) inset;
        }
        .hc1__year-label {
          font-size: 7px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--hc1-dark2);
          opacity: 0.8;
        }
        .hc1__year-num {
          font-size: 22px;
          font-weight: 700;
          color: var(--hc1-dark);
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
          line-height: 1;
        }
      `}</style>

      <div className="hc1__frame">
        <div className="hc1__year" aria-label="Year 1969">
          <span className="hc1__year-label">Year</span>
          <span className="hc1__year-num">1969</span>
        </div>

        <div className="hc1__banner">
          <h2 className="hc1__title">Moon Landing</h2>
          <span className="hc1__star" aria-hidden="true">
            &#9733;
          </span>
        </div>

        <div className="hc1__art">
          {/* real artwork goes here */}
          <div className="hc1__icon" aria-hidden="true">
            &#127769;
          </div>
        </div>

        <div className="hc1__era">
          Era <b>&middot;</b> Space Age
        </div>

        <div className="hc1__box">
          <p className="hc1__flavor">
            &ldquo;One giant leap for mankind.&rdquo;
          </p>
          <p className="hc1__place">Apollo 11 &middot; USA</p>
        </div>

        <div className="hc1__holo" aria-hidden="true" />
      </div>
    </div>
  )
}
