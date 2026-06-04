/** Sample events for the decorative menu fan. Placeholder real artwork from
 *  Wikimedia Commons (public domain) for the preview; the full curated image
 *  set is sourced when the deck is built. Kept separate from the card component
 *  for fast-refresh. */

export type HistoryEvent = {
  year: string
  title: string
  place: string
  era: string
  /** Public-domain image (Wikimedia Commons). */
  img: string
}

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb'

export const SAMPLE_EVENTS: HistoryEvent[] = [
  {
    year: '1789',
    title: 'Bastille',
    place: 'Paris',
    era: 'Revolution',
    img: `${W}/5/57/Anonymous_-_Prise_de_la_Bastille.jpg/330px-Anonymous_-_Prise_de_la_Bastille.jpg`,
  },
  {
    year: '1804',
    title: 'Napoleon',
    place: 'France',
    era: 'Empire',
    img: `${W}/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/330px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg`,
  },
  {
    year: '1903',
    title: 'First Flight',
    place: 'Kitty Hawk',
    era: 'Modern Age',
    img: `${W}/8/86/First_flight2.jpg/330px-First_flight2.jpg`,
  },
  {
    year: '1969',
    title: 'Moon Landing',
    place: 'Apollo 11',
    era: 'Space Age',
    img: `${W}/4/41/A_Man_on_the_Moon%2C_AS11-40-5903_%28cropped%29.jpg/330px-A_Man_on_the_Moon%2C_AS11-40-5903_%28cropped%29.jpg`,
  },
]
