// src/ui/game/play/cardArt.ts
/** Stable 32-bit hash of a string (FNV-1a). */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** A deterministic two-stop gradient for a card, derived from its id. */
export function cardGradient(id: string): string {
  const h = hash(id)
  const hue = h % 360
  const hue2 = (hue + 40) % 360
  return `linear-gradient(150deg, hsl(${hue} 70% 58%), hsl(${hue2} 65% 42%))`
}
