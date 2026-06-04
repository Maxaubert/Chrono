export default function HCard6() {
  return (
    <div className="hc6">
      <style>{`
        .hc6 {
          --hc6-paper: #e9ddbf;
          --hc6-paper-dk: #ddcfa6;
          --hc6-ink: #2b2417;
          --hc6-red: #9c3b2e;
          --hc6-gold: #b8893a;
          --hc6-sage: #7c845f;
          display: inline-block;
          font-family: "Hoefler Text", "Iowan Old Style", "Palatino Linotype",
            Palatino, Georgia, "Times New Roman", serif;
          color: var(--hc6-ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ---- outer perforated stamp body ---- */
        .hc6 .hc6-stamp {
          position: relative;
          width: 300px;
          height: 420px;
          padding: 16px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 18% 12%, rgba(156,59,46,0.05), transparent 40%),
            radial-gradient(circle at 82% 88%, rgba(124,132,95,0.07), transparent 45%),
            linear-gradient(160deg, var(--hc6-paper) 0%, var(--hc6-paper-dk) 100%);
          /* scalloped / perforated edge via radial-gradient mask */
          -webkit-mask:
            radial-gradient(circle 7px at center, transparent 6px, #000 6.5px)
              0 0 / 20px 20px;
          mask:
            radial-gradient(circle 7px at center, transparent 6px, #000 6.5px)
              0 0 / 20px 20px;
          filter: drop-shadow(0 8px 14px rgba(43,36,23,0.35));
        }

        /* paper speckle */
        .hc6 .hc6-stamp::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.5;
          background-image:
            radial-gradient(rgba(43,36,23,0.16) 0.6px, transparent 0.7px),
            radial-gradient(rgba(43,36,23,0.1) 0.5px, transparent 0.6px);
          background-size: 7px 7px, 11px 11px;
          background-position: 0 0, 4px 6px;
          mix-blend-mode: multiply;
        }

        /* ---- inner letterpress frame ---- */
        .hc6 .hc6-frame {
          position: relative;
          height: 100%;
          box-sizing: border-box;
          padding: 14px 14px 16px;
          border: 1.5px solid var(--hc6-ink);
          outline: 1px solid var(--hc6-ink);
          outline-offset: 3px;
          display: flex;
          flex-direction: column;
        }
        .hc6 .hc6-frame::after {
          content: "";
          position: absolute;
          inset: 4px;
          border: 0.5px dashed rgba(43,36,23,0.4);
          pointer-events: none;
        }

        /* ---- top band: denomination + country ---- */
        .hc6 .hc6-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .hc6 .hc6-year {
          font-size: 40px;
          line-height: 0.9;
          font-weight: 700;
          letter-spacing: -1px;
          color: var(--hc6-red);
          text-shadow: 0.5px 0.5px 0 rgba(43,36,23,0.25);
        }
        .hc6 .hc6-year small {
          display: block;
          font-size: 8px;
          letter-spacing: 2.5px;
          font-weight: 600;
          color: var(--hc6-ink);
          text-transform: uppercase;
          margin-top: 3px;
        }
        .hc6 .hc6-country {
          text-align: right;
          font-size: 8.5px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--hc6-sage);
          line-height: 1.5;
          padding-top: 4px;
        }
        .hc6 .hc6-country b {
          display: block;
          color: var(--hc6-ink);
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        /* ---- engraving art panel ---- */
        .hc6 .hc6-art {
          position: relative;
          margin: 12px 0 10px;
          height: 168px;
          border: 1px solid var(--hc6-ink);
          background:
            radial-gradient(ellipse at center,
              var(--hc6-paper) 30%, var(--hc6-paper-dk) 78%, #c9b888 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* faint engraving hatching */
        .hc6 .hc6-art::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(45deg,
              rgba(43,36,23,0.07) 0 1px, transparent 1px 5px),
            repeating-linear-gradient(-45deg,
              rgba(43,36,23,0.05) 0 1px, transparent 1px 6px);
        }
        /* vignette */
        .hc6 .hc6-art::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow: inset 0 0 34px 10px rgba(43,36,23,0.4);
        }
        .hc6 .hc6-icon {
          position: relative;
          font-size: 84px;
          line-height: 1;
          z-index: 1;
          /* duotone ink treatment */
          filter: grayscale(1) sepia(0.5) brightness(0.7) contrast(1.4);
          mix-blend-mode: multiply;
          text-shadow:
            0 2px 0 rgba(43,36,23,0.25),
            1px 1px 6px rgba(43,36,23,0.45);
        }

        /* corner ornaments on art */
        .hc6 .hc6-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 1px solid var(--hc6-gold);
          z-index: 2;
        }
        .hc6 .hc6-corner.tl { top: 5px; left: 5px; border-right: 0; border-bottom: 0; }
        .hc6 .hc6-corner.tr { top: 5px; right: 5px; border-left: 0; border-bottom: 0; }
        .hc6 .hc6-corner.bl { bottom: 5px; left: 5px; border-right: 0; border-top: 0; }
        .hc6 .hc6-corner.br { bottom: 5px; right: 5px; border-left: 0; border-top: 0; }

        /* ---- title block ---- */
        .hc6 .hc6-rule {
          height: 0;
          border-top: 1px solid var(--hc6-ink);
          border-bottom: 1px solid var(--hc6-ink);
          padding-top: 2px;
          margin: 2px 0 8px;
        }
        .hc6 .hc6-title {
          text-align: center;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: 0.3px;
          line-height: 1.05;
          color: var(--hc6-ink);
        }
        .hc6 .hc6-flavor {
          text-align: center;
          font-size: 12px;
          font-style: italic;
          color: var(--hc6-sage);
          margin-top: 5px;
        }

        /* bottom letterpress line */
        .hc6 .hc6-foot {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 7.5px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--hc6-ink);
          padding-top: 8px;
        }
        .hc6 .hc6-foot span { opacity: 0.7; }

        /* ---- postmark overlay ---- */
        .hc6 .hc6-postmark {
          position: absolute;
          top: 150px;
          right: 18px;
          width: 96px;
          height: 96px;
          transform: rotate(-16deg);
          opacity: 0.42;
          color: var(--hc6-red);
          pointer-events: none;
          z-index: 5;
          mix-blend-mode: multiply;
        }
        .hc6 .hc6-postmark svg { width: 100%; height: 100%; display: block; }
      `}</style>

      <div className="hc6-stamp">
        <div className="hc6-frame">
          <div className="hc6-top">
            <div className="hc6-year">
              1455
              <small>Anno · Year</small>
            </div>
            <div className="hc6-country">
              Holy Roman
              <b>Empire</b>
              Renaissance Era
            </div>
          </div>

          <div className="hc6-art">
            <span className="hc6-corner tl" />
            <span className="hc6-corner tr" />
            <span className="hc6-corner bl" />
            <span className="hc6-corner br" />
            <span className="hc6-icon" role="img" aria-label="book">
              📖
            </span>
          </div>

          <div className="hc6-rule" />
          <div className="hc6-title">Printing Press</div>
          <div className="hc6-flavor">&ldquo;Words made many.&rdquo;</div>

          <div className="hc6-foot">
            <span>Mainz</span>
            <span>·</span>
            <span>Germany</span>
          </div>
        </div>

        <div className="hc6-postmark" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <circle
              cx="50"
              cy="50"
              r="33"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <path id="hc6-arc-top" d="M14,50 A36,36 0 0 1 86,50" fill="none" />
            <path id="hc6-arc-bot" d="M14,50 A36,36 0 0 0 86,50" fill="none" />
            <text
              fontSize="9"
              letterSpacing="2.5"
              fill="currentColor"
              fontFamily="Georgia, serif"
              fontWeight="700"
            >
              <textPath
                href="#hc6-arc-top"
                startOffset="50%"
                textAnchor="middle"
              >
                CHRONO · POST
              </textPath>
            </text>
            <text
              fontSize="8"
              letterSpacing="2"
              fill="currentColor"
              fontFamily="Georgia, serif"
            >
              <textPath
                href="#hc6-arc-bot"
                startOffset="50%"
                textAnchor="middle"
              >
                MAINZ
              </textPath>
            </text>
            <text
              x="50"
              y="54"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="currentColor"
              fontFamily="Georgia, serif"
            >
              1455
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
