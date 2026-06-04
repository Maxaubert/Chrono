/** Sample events for the decorative menu fan (placeholders). Kept separate from
 *  the card component for fast-refresh. */

export type HistoryEvent = {
  year: string
  title: string
  place: string
}

export const SAMPLE_EVENTS: HistoryEvent[] = [
  { year: '1215', title: 'Magna Carta', place: 'England' },
  { year: '1492', title: 'New World', place: 'Atlantic' },
  { year: '1789', title: 'Revolution', place: 'France' },
  { year: '1969', title: 'Moon Landing', place: 'Apollo 11' },
]
