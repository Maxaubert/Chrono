import MysteryCard from '../play/MysteryCard'
import type { MysteryProps } from '../play/adapter'

/** Hitster's mystery slot: the existing audio play/pause card. The mystery
 *  identity is carried by audio (the song plays), so `drawn` is unused here. */
export default function HitsterMystery({
  isPlaying,
  onPause,
  onResume,
  onReplay,
}: MysteryProps) {
  return (
    <MysteryCard
      isPlaying={isPlaying}
      onPause={onPause}
      onResume={onResume}
      onReplay={onReplay}
    />
  )
}
