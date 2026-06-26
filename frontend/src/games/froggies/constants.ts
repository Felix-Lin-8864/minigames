import type { BetType, FrogColour } from './types'

/** Minimum wager per bet in tadpoles. */
export const MIN_BET = 5

/** Bet input step in tadpoles. */
export const BET_STEP = 5

/** Number of squares on the track (positions 0–39). */
export const TRACK_SQUARES = 40

/** Position at the finish line (last square). */
export const FINISH_POSITION = TRACK_SQUARES - 1

/** Milliseconds between race animation ticks. */
export const TICK_MS = 80

export const FROGS: FrogColour[] = ['green', 'blue', 'red', 'yellow', 'purple']

export const FROG_LABELS: Record<FrogColour, string> = {
  green: 'Green',
  blue: 'Blue',
  red: 'Red',
  yellow: 'Yellow',
  purple: 'Purple',
}

export const FROG_COLOURS: Record<FrogColour, string> = {
  green: '#4caf50',
  blue: '#2196f3',
  red: '#f44336',
  yellow: '#ffeb3b',
  purple: '#9c27b0',
}

export const BET_TYPE_LABELS: Record<BetType, string> = {
  win: 'Win',
  exacta: 'Exacta',
  trifecta: 'Trifecta',
  superfecta: 'Superfecta',
  fullhouse: 'Full House',
}

export const MULTIPLIERS: Record<BetType, number> = {
  win: 4,
  exacta: 16,
  trifecta: 48,
  superfecta: 96,
  fullhouse: 96,
}

export const SLOT_COUNTS: Record<BetType, number> = {
  win: 1,
  exacta: 2,
  trifecta: 3,
  superfecta: 4,
  fullhouse: 5,
}

export const WIN_PROBABILITIES: Record<BetType, number> = {
  win: 1 / 5,
  exacta: 1 / 20,
  trifecta: 1 / 60,
  superfecta: 1 / 120,
  fullhouse: 1 / 120,
}

export const BET_TYPES: BetType[] = [
  'win',
  'exacta',
  'trifecta',
  'superfecta',
  'fullhouse',
]

export const ORDINAL_LABELS = ['1st', '2nd', '3rd', '4th', '5th'] as const

/** Pixel size of each grid square. */
export const CELL_SIZE_PX = 16
