import { useEffect, useState } from 'react'
import { renderQrDataUrl, trackIdToOpenUrl } from '@/scan'
import './mystery-card.css'

export default function MysteryCard({
  onReplay,
  onPause,
  onResume,
  isPlaying = true,
  qr = false,
  trackId,
}: {
  onReplay: () => void
  onPause: () => void
  onResume: () => void
  isPlaying?: boolean
  /** Guest mode: show a QR to scan into the player's own Spotify, no controls. */
  qr?: boolean
  trackId?: string
}) {
  if (qr) return <QrMystery trackId={trackId} />

  return (
    <div className="mystery-wrap">
      <div className={`h-card mystery ${isPlaying ? '' : 'paused'}`}>
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
        <button
          className="myst-ctl"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={isPlaying ? onPause : onResume}
        >
          {isPlaying ? <>&#10073;&#10073;</> : <>&#9654;</>}
        </button>
      </div>
      <div className="myst-hint">tap a slot below to place this</div>
    </div>
  )
}

/** Guest-mode mystery card: a QR of the track's Spotify link. Players scan it
 * with their own Spotify app to play the full song; nothing streams in-app. */
function QrMystery({ trackId }: { trackId?: string }) {
  const link = trackId ? trackIdToOpenUrl(trackId) : null
  // Keyed by link so a stale result for a previous track is ignored (and we
  // never reset state synchronously inside the effect).
  const [result, setResult] = useState<{
    link: string
    dataUrl: string | null
  } | null>(null)

  useEffect(() => {
    if (!link) return
    let alive = true
    renderQrDataUrl(link)
      .then((dataUrl) => alive && setResult({ link, dataUrl }))
      .catch(() => alive && setResult({ link, dataUrl: null }))
    return () => {
      alive = false
    }
  }, [link])

  const current = result && result.link === link ? result : null
  const dataUrl = current?.dataUrl ?? null
  const failed = current != null && current.dataUrl == null

  return (
    <div className="mystery-wrap">
      <div className="h-card mystery mystery-qr">
        {dataUrl ? (
          <img className="myst-qr-img" src={dataUrl} alt="Scan to play" />
        ) : (
          <span className="myst-q">?</span>
        )}
        <div className="myst-label">SCAN TO PLAY</div>
        <div className="myst-sub">OPENS IN YOUR SPOTIFY APP</div>
      </div>
      {failed && link && (
        <a
          className="myst-qr-fallback"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {link}
        </a>
      )}
      <div className="myst-hint">
        scan to hear it, then tap a slot to place it
      </div>
    </div>
  )
}
