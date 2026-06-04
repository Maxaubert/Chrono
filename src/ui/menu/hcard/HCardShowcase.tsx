import HCard1 from './HCard1'
import HCard2 from './HCard2'
import HCard3 from './HCard3'
import HCard4 from './HCard4'
import HCard5 from './HCard5'
import HCard6 from './HCard6'

/**
 * Throwaway gallery: 6 stylish "trading card" design directions for the real
 * History card (art + frame, TCG-inspired). Placeholder art (emoji/SVG) stands
 * in for real artwork. Served at ?hcard=1. Delete once a direction is chosen.
 */

const CARDS: [React.ComponentType, string, string][] = [
  [HCard1, '1 · Pokémon-style', 'ornate frame, art window, year gem, holo'],
  [HCard2, '2 · Magic-style', 'title bar, type line, flavor text box'],
  [HCard3, '3 · Cinematic full-bleed', 'art fills card, scrim + dramatic year'],
  [HCard4, '4 · Illuminated manuscript', 'parchment, filigree, wax seal'],
  [HCard5, '5 · Minimal luxury', 'negative space, medallion, big light year'],
  [HCard6, '6 · Vintage stamp', 'perforated edge, engraving, postmark'],
]

export default function HCardShowcase() {
  return (
    <div className="hcg-root">
      <style>{PAGE_CSS}</style>
      <div className="hcg-bar">
        <span>HISTORY CARD &middot; DESIGN DIRECTIONS</span>
        <span className="hcg-note">
          placeholder art &mdash; real artwork TBD
        </span>
      </div>
      <div className="hcg-grid">
        {CARDS.map(([Card, title, desc]) => (
          <section className="hcg-cell" key={title}>
            <div className="hcg-card">
              <Card />
            </div>
            <div className="hcg-label">
              <b>{title}</b>
              <span>{desc}</span>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

const PAGE_CSS = `
.hcg-root{min-height:100vh;background:#0b0b0d;color:#cfc6ad;font-family:Georgia,'Times New Roman',serif;padding-bottom:60px}
.hcg-bar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:14px 26px;background:#0e0e10;border-bottom:1px solid #22201a;font-weight:700;letter-spacing:3px;font-size:13px;color:#cda349;text-transform:uppercase}
.hcg-note{font-size:11px;letter-spacing:1px;color:#7d7556;text-transform:none;font-style:italic}
.hcg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1180px;margin:0 auto;padding:28px 20px}
.hcg-cell{display:flex;flex-direction:column;align-items:center;gap:14px}
.hcg-card{display:grid;place-items:center;min-height:440px}
.hcg-label{text-align:center}
.hcg-label b{display:block;font-size:14px;letter-spacing:1px;color:#e3d7ad}
.hcg-label span{display:block;font-size:11px;font-style:italic;letter-spacing:.5px;color:#7d7a55;margin-top:3px}
@media(max-width:1000px){.hcg-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:680px){.hcg-grid{grid-template-columns:1fr}}
`
