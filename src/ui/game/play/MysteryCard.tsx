import './mystery-card.css'

export default function MysteryCard({
  onReplay,
  onPause,
}: {
  onReplay: () => void
  onPause: () => void
}) {
  return (
    <div className="mystery-wrap">
      <div className="h-card front mystery">
        <div className="myst-disc" />
        <div className="myst-eq" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </div>
        <span className="myst-q">?</span>
        <div className="myst-label">NOW PLAYING</div>
        <div className="myst-sub">MYSTERY TRACK</div>
      </div>
      <div className="myst-controls">
        <button className="myst-ctl" aria-label="Replay" onClick={onReplay}>
          &#8635;
        </button>
        <button className="myst-ctl" aria-label="Pause" onClick={onPause}>
          &#10073;&#10073;
        </button>
      </div>
      <div className="myst-hint">tap a slot below to place this</div>
    </div>
  )
}
