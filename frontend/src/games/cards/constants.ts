/** Number of standard 52-card decks in the shoe. */
export const DECK_COUNT = 6

/** Total cards per shoe era (6 × 52). */
export const SHOE_SIZE = DECK_COUNT * 52

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const

export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const
