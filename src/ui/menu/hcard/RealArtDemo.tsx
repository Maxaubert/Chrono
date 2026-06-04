/**
 * Throwaway proof-of-concept: real public-domain images (Wikimedia Commons, via
 * the Wikipedia REST API) on History cards, unified by ONE treatment (warm gold
 * duotone + scrim + grain) so paintings and photos read as a single set.
 * Served at ?artdemo=1. Delete after the art-source approach is decided.
 */

type Event = {
  year: string
  title: string
  era: string
  place: string
  flavor: string
  img: string
  kind: string
}

const EVENTS: Event[] = [
  {
    year: '1804',
    title: 'Napoleon',
    era: 'Empire',
    place: 'France',
    flavor: 'Emperor of the French.',
    kind: 'oil painting',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/330px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg',
  },
  {
    year: '1789',
    title: 'Storming of the Bastille',
    era: 'Revolution',
    place: 'Paris',
    flavor: 'The Revolution ignites.',
    kind: 'oil painting',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Anonymous_-_Prise_de_la_Bastille.jpg/330px-Anonymous_-_Prise_de_la_Bastille.jpg',
  },
  {
    year: '1903',
    title: 'First Flight',
    era: 'Modern Age',
    place: 'Kitty Hawk',
    flavor: 'Twelve seconds aloft.',
    kind: 'photograph',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/First_flight2.jpg/330px-First_flight2.jpg',
  },
  {
    year: '1969',
    title: 'Moon Landing',
    era: 'Space Age',
    place: 'Apollo 11',
    flavor: 'One giant leap.',
    kind: 'photograph',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/A_Man_on_the_Moon%2C_AS11-40-5903_%28cropped%29.jpg/330px-A_Man_on_the_Moon%2C_AS11-40-5903_%28cropped%29.jpg',
  },
]

function Card({ e }: { e: Event }) {
  return (
    <div className="rad-card">
      <div className="rad-art">
        <img src={e.img} alt={e.title} loading="lazy" />
        <span className="rad-duo" />
        <span className="rad-grain" />
        <span className="rad-scrim" />
      </div>
      <span className="rad-year">{e.year}</span>
      <div className="rad-meta">
        <span className="rad-era">
          {e.era} &middot; {e.place}
        </span>
        <h3 className="rad-title">{e.title}</h3>
        <span className="rad-flavor">{e.flavor}</span>
      </div>
      <span className="rad-kind">{e.kind}</span>
    </div>
  )
}

export default function RealArtDemo() {
  return (
    <div className="rad-root">
      <style>{CSS}</style>
      <div className="rad-bar">
        <span>HISTORY CARDS &middot; REAL ART (PROOF OF CONCEPT)</span>
        <span className="rad-note">
          Wikimedia public-domain images &middot; one shared duotone treatment
        </span>
      </div>
      <div className="rad-grid">
        {EVENTS.map((e) => (
          <Card e={e} key={e.title} />
        ))}
      </div>
      <p className="rad-foot">
        Each picture comes straight from Wikimedia Commons (public domain). They
        are different media, two paintings and two photographs, yet the same
        gold duotone + scrim + grain makes them feel like one deck. Swap the
        treatment and the whole set restyles at once.
      </p>
    </div>
  )
}

const CSS = `
.rad-root{min-height:100vh;background:#0b0b0d;color:#cfc6ad;font-family:Georgia,'Times New Roman',serif;padding-bottom:50px}
.rad-bar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:14px 26px;background:#0e0e10;border-bottom:1px solid #22201a;font-weight:700;letter-spacing:3px;font-size:13px;color:#cda349;text-transform:uppercase}
.rad-note{font-size:11px;letter-spacing:1px;color:#7d7556;text-transform:none;font-style:italic}
.rad-grid{display:flex;flex-wrap:wrap;gap:26px;justify-content:center;padding:34px 20px 10px}
.rad-foot{max-width:760px;margin:6px auto 0;text-align:center;font-size:13px;line-height:1.6;color:#9c916f;font-style:italic;padding:0 20px}

.rad-card{position:relative;width:300px;height:420px;border-radius:16px;overflow:hidden;
  box-shadow:0 26px 54px -18px rgba(0,0,0,.85),0 0 0 1px rgba(0,0,0,.6);
  border:1px solid #cda349;outline:4px solid #14140c;outline-offset:-6px}
.rad-art{position:absolute;inset:0}
.rad-art img{width:100%;height:100%;object-fit:cover;display:block;
  /* unify wildly different source images into one warm, slightly faded look */
  filter:grayscale(1) contrast(1.06) brightness(.96)}
/* gold duotone tint over the grayscale image */
.rad-duo{position:absolute;inset:0;mix-blend-mode:color;opacity:.5;
  background:linear-gradient(180deg,#e6c069,#7a5a23 55%,#2a1e0c)}
.rad-grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.rad-scrim{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(10,8,4,.35) 0%,transparent 26%,transparent 50%,rgba(10,8,4,.82) 86%),
  radial-gradient(120% 60% at 50% 0%,rgba(255,240,200,.12),transparent 60%)}

.rad-year{position:absolute;top:12px;right:16px;z-index:3;font-size:30px;font-weight:700;color:#f3e3b8;
  letter-spacing:1px;text-shadow:0 2px 10px rgba(0,0,0,.8)}
.rad-meta{position:absolute;left:18px;right:18px;bottom:18px;z-index:3;display:flex;flex-direction:column;gap:4px}
.rad-era{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#e6c069}
.rad-title{margin:0;font-size:25px;line-height:1.08;color:#fbf3df;text-shadow:0 2px 14px rgba(0,0,0,.85)}
.rad-flavor{font-style:italic;font-size:13px;color:#d8cba6}
.rad-kind{position:absolute;top:14px;left:16px;z-index:3;font-size:9px;letter-spacing:2px;text-transform:uppercase;
  color:#14140c;background:#cda349;padding:2px 7px;border-radius:4px;opacity:.92}
`
