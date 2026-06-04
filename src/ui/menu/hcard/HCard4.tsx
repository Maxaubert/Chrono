export default function HCard4() {
  return (
    <div className="hc4">
      <style>{`
        .hc4 {
          --hc4-parchment: #efe6cf;
          --hc4-parchment-deep: #e7dab4;
          --hc4-ink: #2a2114;
          --hc4-gold: #b8893a;
          --hc4-gold-deep: #8f6422;
          --hc4-sage: #7c845f;
          width: 300px;
          height: 420px;
          position: relative;
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
          color: var(--hc4-ink);
          user-select: none;
          -webkit-font-smoothing: antialiased;
        }

        .hc4 *,
        .hc4 *::before,
        .hc4 *::after {
          box-sizing: border-box;
        }

        /* ---- Card body: parchment ---- */
        .hc4__card {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          overflow: hidden;
          background:
            radial-gradient(120% 90% at 30% 8%, #f6efda 0%, var(--hc4-parchment) 42%, var(--hc4-parchment-deep) 100%),
            var(--hc4-parchment);
          box-shadow:
            0 18px 40px -14px rgba(42, 33, 20, 0.55),
            0 2px 0 rgba(255, 255, 255, 0.35) inset;
        }

        /* faint aged speckle + fiber texture */
        .hc4__card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 18% 28%, rgba(143, 100, 34, 0.10) 0 1px, transparent 2px),
            radial-gradient(circle at 72% 16%, rgba(143, 100, 34, 0.08) 0 1px, transparent 2px),
            radial-gradient(circle at 58% 74%, rgba(42, 33, 20, 0.06) 0 1px, transparent 2px),
            radial-gradient(circle at 33% 88%, rgba(143, 100, 34, 0.07) 0 1px, transparent 2px),
            radial-gradient(circle at 88% 56%, rgba(42, 33, 20, 0.05) 0 1px, transparent 2px);
          opacity: 0.9;
          mix-blend-mode: multiply;
        }

        /* darkened vignette edges for aged feel */
        .hc4__card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow:
            inset 0 0 36px rgba(122, 90, 40, 0.30),
            inset 0 0 90px rgba(122, 90, 40, 0.15);
          border-radius: 8px;
        }

        /* ---- Ornate illuminated border ---- */
        .hc4__frame {
          position: absolute;
          inset: 10px;
          border: 2px solid var(--hc4-gold-deep);
          border-radius: 4px;
          box-shadow:
            0 0 0 1px var(--hc4-gold) inset,
            0 0 0 4px var(--hc4-parchment) inset,
            0 0 0 5px rgba(143, 100, 34, 0.55) inset;
          pointer-events: none;
        }

        /* double-rule inner line drawn with a gradient strip */
        .hc4__inner-rule {
          position: absolute;
          inset: 18px;
          border: 1px solid rgba(143, 100, 34, 0.6);
          border-radius: 2px;
          pointer-events: none;
        }

        /* corner flourishes (SVG filigree) */
        .hc4__corner {
          position: absolute;
          width: 46px;
          height: 46px;
          color: var(--hc4-gold-deep);
          pointer-events: none;
        }
        .hc4__corner svg { display: block; width: 100%; height: 100%; }
        .hc4__corner--tl { top: 6px; left: 6px; }
        .hc4__corner--tr { top: 6px; right: 6px; transform: scaleX(-1); }
        .hc4__corner--bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
        .hc4__corner--br { bottom: 6px; right: 6px; transform: scale(-1, -1); }

        /* ---- Inner content stack ---- */
        .hc4__content {
          position: absolute;
          inset: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Header: year banner */
        .hc4__year-band {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }
        .hc4__year-rule {
          height: 1px;
          width: 34px;
          background: linear-gradient(90deg, transparent, var(--hc4-gold-deep));
        }
        .hc4__year-rule--r {
          background: linear-gradient(90deg, var(--hc4-gold-deep), transparent);
        }
        .hc4__year {
          font-size: 40px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--hc4-gold-deep);
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.5),
            0 2px 3px rgba(42, 33, 20, 0.25);
          font-variant-numeric: lining-nums;
        }
        .hc4__roman {
          font-size: 10px;
          letter-spacing: 4px;
          color: var(--hc4-sage);
          margin-top: 3px;
          text-transform: uppercase;
        }

        /* ---- Engraving art panel ---- */
        .hc4__panel {
          position: relative;
          width: 158px;
          height: 158px;
          margin-top: 12px;
          border-radius: 3px;
          background:
            radial-gradient(circle at 50% 38%, #d8c79a 0%, #c9b482 45%, #a8915c 100%);
          border: 2px solid var(--hc4-gold-deep);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.35) inset,
            0 4px 10px -4px rgba(42, 33, 20, 0.6);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* faint engraving hatch lines */
        .hc4__panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(135deg, rgba(42,33,20,0.10) 0 1px, transparent 1px 5px),
            repeating-linear-gradient(45deg, rgba(42,33,20,0.06) 0 1px, transparent 1px 7px);
          pointer-events: none;
        }
        /* vignette inside engraving */
        .hc4__panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 45%, transparent 38%, rgba(42, 33, 20, 0.55) 100%);
          pointer-events: none;
        }
        .hc4__icon {
          font-size: 78px;
          line-height: 1;
          filter:
            sepia(1) saturate(0.7) brightness(0.85) contrast(1.05)
            drop-shadow(0 2px 2px rgba(42, 33, 20, 0.4));
          transform: translateY(-2px);
          position: relative;
          z-index: 1;
        }

        /* ---- Title (calligraphic / blackletter flavour) ---- */
        .hc4__title {
          margin-top: 14px;
          font-size: 25px;
          line-height: 1.05;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--hc4-ink);
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
          font-variant: small-caps;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
        }
        .hc4__title-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 5px;
          color: var(--hc4-gold-deep);
        }
        .hc4__title-rule i {
          height: 1px;
          width: 40px;
          background: linear-gradient(90deg, transparent, var(--hc4-gold-deep), transparent);
          display: block;
        }
        .hc4__diamond {
          width: 5px;
          height: 5px;
          background: var(--hc4-gold-deep);
          transform: rotate(45deg);
        }

        /* place */
        .hc4__place {
          margin-top: 6px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--hc4-sage);
        }

        /* flavor inscription */
        .hc4__flavor {
          margin-top: 7px;
          font-size: 12.5px;
          font-style: italic;
          line-height: 1.3;
          color: rgba(42, 33, 20, 0.78);
          max-width: 220px;
        }

        /* ---- Wax seal emblem ---- */
        .hc4__seal {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 46px;
          height: 46px;
        }
        .hc4__seal svg { display: block; width: 100%; height: 100%; }
      `}</style>

      <div className="hc4__card">
        <div className="hc4__frame" />
        <div className="hc4__inner-rule" />

        {/* Corner flourishes */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <span key={c} className={`hc4__corner hc4__corner--${c}`}>
            <svg viewBox="0 0 46 46" fill="none" aria-hidden="true">
              <path
                d="M2 2 L2 22 M2 2 L22 2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M5 5 C 5 16, 14 7, 18 18 C 9 14, 16 5, 5 5 Z"
                fill="currentColor"
                opacity="0.85"
              />
              <path
                d="M6 20 C 14 18, 18 12, 20 6"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.7"
              />
              <circle cx="24" cy="6" r="1.6" fill="currentColor" />
              <circle cx="6" cy="24" r="1.6" fill="currentColor" />
              <circle
                cx="11"
                cy="11"
                r="1.1"
                fill="currentColor"
                opacity="0.8"
              />
            </svg>
          </span>
        ))}

        <div className="hc4__content">
          {/* Year + roman numerals */}
          <div className="hc4__year-band">
            <span className="hc4__year-rule" />
            <span className="hc4__year">1215</span>
            <span className="hc4__year-rule hc4__year-rule--r" />
          </div>
          <div className="hc4__roman">· MCCXV ·</div>

          {/* Engraving art panel */}
          <div className="hc4__panel">
            <span className="hc4__icon" role="img" aria-label="charter scroll">
              📜
            </span>
          </div>

          {/* Title */}
          <div className="hc4__title">Magna Carta</div>
          <div className="hc4__title-rule">
            <i />
            <span className="hc4__diamond" />
            <i />
          </div>

          {/* Place + flavor */}
          <div className="hc4__place">Runnymede · England</div>
          <div className="hc4__flavor">The first charter of liberties.</div>
        </div>

        {/* Wax seal emblem */}
        <span className="hc4__seal" aria-hidden="true">
          <svg viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="21" fill="#8f2f24" />
            <circle
              cx="23"
              cy="23"
              r="21"
              fill="none"
              stroke="#5d1c15"
              strokeWidth="2"
            />
            <circle
              cx="23"
              cy="23"
              r="16"
              fill="none"
              stroke="#c4554a"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <path
              d="M23 11 L25.6 19 L34 19 L27.2 24 L29.8 32 L23 27 L16.2 32 L18.8 24 L12 19 L20.4 19 Z"
              fill="#c4554a"
              opacity="0.9"
            />
            <circle cx="23" cy="23" r="3" fill="#5d1c15" />
          </svg>
        </span>
      </div>
    </div>
  )
}
