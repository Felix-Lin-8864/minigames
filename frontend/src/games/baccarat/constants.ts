/** Minimum wager per hand in tadpoles. */
export const MIN_BET = 5

/** Bet input step in tadpoles. */
export const BET_STEP = 5

/** Reshuffle after this many completed hands. */
export const HANDS_PER_SHOE = 8

/** Delay after all cards are dealt before the result overlay appears. */
export const RESULT_BANNER_DELAY_MS = 2000

/** Standard 5% commission on winning Banker bets. */
export const BANKER_COMMISSION = 0.05

export const BET_TYPE_LABELS = {
  player: 'Player (1:1)',
  banker: 'Banker (0.95:1)',
  tie: 'Tie (8:1)',
} as const
