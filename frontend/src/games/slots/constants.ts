import type { SlotSymbol } from './types'

/** Minimum wager per spin in tadpoles. */
export const MIN_BET = 5

export const SLOT_SYMBOLS: SlotSymbol[] = [
  'fly',
  'reed',
  'droplet',
  'lilypad',
  'caterpillar',
  'egg',
  'goldenfrog',
]

export const SYMBOL_WEIGHTS = [30, 24, 18, 12, 8, 5, 3]

export const PAYOUTS: Record<SlotSymbol, number> = {
  fly: 2,
  reed: 3,
  droplet: 5,
  lilypad: 8,
  caterpillar: 15,
  egg: 30,
  goldenfrog: 100,
}

/** 2-of-a-kind partial payouts for rare symbols only. */
export const PARTIAL_PAYOUTS: Partial<Record<SlotSymbol, number>> = {
  caterpillar: 3,
  egg: 5,
  goldenfrog: 8,
}

/** Per-reel stop delay after spin is triggered (left, centre, right). */
export const REEL_STOP_MS = [600, 900, 1200] as const

/** Total spin animation duration — right reel stop time. */
export const SPIN_DURATION_MS = REEL_STOP_MS[2]
