/** Number of standard 52-card decks in the shoe. */
export const DECK_COUNT = 6

/** Total cards per shoe era (6 × 52). */
export const SHOE_SIZE = DECK_COUNT * 52

/** Reshuffle after this many completed hands. */
export const HANDS_PER_SHOE = 5

/** Minimum pair-bet side wager in tadpoles. */
export const MIN_PAIR_BET = 5

/** Minimum main-hand wager in tadpoles. */
export const MIN_BET = 10

/** Dealer stands on all 17s, including soft 17. */
export const DEALER_HITS_SOFT_17 = false

/** Natural blackjack pays 3:2 (1.5× bet profit). */
export const BLACKJACK_PAYOUT_NUMERATOR = 3
export const BLACKJACK_PAYOUT_DENOMINATOR = 2

/** Players may split pairs up to 2 times (3 hands total). */
export const MAX_SPLITS = 2

/**
 * When false, split and re-split hands (including aces) may receive further hits.
 */
export const SPLIT_ACES_ONE_CARD = false

/** Doubling after splitting is not allowed. */
export const DOUBLE_AFTER_SPLIT = false

export const CARD_VALUE_KEYS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

export type CardValueKey = (typeof CARD_VALUE_KEYS)[number]

/** Per-deck counts used to seed remaining-card tracking. */
export const PER_DECK_VALUE_COUNTS: Record<CardValueKey, number> = {
  A: 4,
  '2': 4,
  '3': 4,
  '4': 4,
  '5': 4,
  '6': 4,
  '7': 4,
  '8': 4,
  '9': 4,
  '10': 16,
}

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
