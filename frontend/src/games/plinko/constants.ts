import type { RiskTier } from './types'

/** Minimum wager per drop in tadpoles. */
export const MIN_BET = 1

export const ROWS = 12

export const SLOT_COUNT = ROWS + 1

/** Ball travels one row every 100ms (12 rows ≈ 1.2s). */
export const ROW_MS = 100

export const DROP_DURATION_MS = ROWS * ROW_MS

/**
 * Binomial landing probabilities for 12 rows: P(slot) = C(12, slot) / 2^12.
 * Index = slot (0–12).
 */
export const SLOT_PROBABILITIES: number[] = (() => {
  const total = 2 ** ROWS
  let comb = 1
  const probs: number[] = []
  for (let slot = 0; slot <= ROWS; slot += 1) {
    if (slot > 0) {
      comb = (comb * (ROWS - slot + 1)) / slot
    }
    probs.push(comb / total)
  }
  return probs
})()

/**
 * Multipliers per risk tier (index = slot 0–12).
 * Retuned from spec tables to ~15% RTP while preserving tier variance shape.
 * Low RTP ≈ 14.97%, Medium ≈ 15.25%, High ≈ 14.65%.
 */
export const MULTIPLIERS: Record<RiskTier, number[]> = {
  low: [2.5, 1, 0.5, 0.2, 0.2, 0.1, 0.08, 0.1, 0.2, 0.2, 0.5, 1, 2.5],
  medium: [20, 4, 1, 0.4, 0.1, 0.04, 0.02, 0.04, 0.1, 0.4, 1, 4, 20],
  high: [82, 10, 1, 0.1, 0.02, 0, 0, 0, 0.02, 0.1, 1, 10, 82],
}

export const RISK_TIER_LABELS: Record<RiskTier, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

/** Symmetric slot groupings for multiplier table display. */
export const MULTIPLIER_TABLE_GROUPS: { slots: number[]; slotLabel: string }[] = [
  { slots: [0, 12], slotLabel: '0, 12' },
  { slots: [1, 11], slotLabel: '1, 11' },
  { slots: [2, 10], slotLabel: '2, 10' },
  { slots: [3, 9], slotLabel: '3, 9' },
  { slots: [4, 8], slotLabel: '4, 8' },
  { slots: [5, 7], slotLabel: '5, 7' },
  { slots: [6], slotLabel: '6' },
]

export function slotColorTier(multiplier: number): 'green' | 'yellow' | 'red' {
  if (multiplier >= 5) return 'green'
  if (multiplier >= 1) return 'yellow'
  return 'red'
}

export const SLOT_COLOR_VALUES = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
} as const
