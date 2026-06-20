/** Minimum dealt cards before Hi-Lo interpretation is shown (half a deck). */
export const MIN_CARDS_FOR_HI_LO_INTERPRETATION = 26

/** Baseline house edge (%) at true count 0 — approximation for 6-deck S17. */
export const BASELINE_HOUSE_EDGE_PERCENT = -0.5

/** Rule-of-thumb edge shift per +1 true count (%) — not simulation-derived. */
export const EDGE_SHIFT_PER_TRUE_COUNT = 0.5

export interface CountInterpretation {
  ready: boolean
  label: string
  suggestedBet: number
  estimatedEdgePercent: number
}

function countStrengthLabel(trueCount: number): string {
  if (trueCount < 1) return 'Cold shoe — bet minimum'
  if (trueCount < 2) return 'Neutral — no edge yet'
  if (trueCount < 4) return 'Favorable — raise your bet'
  return 'Hot shoe — bet aggressively'
}

/** Suggested wager in units of the minimum bet for the current true count. */
export function unitsForTrueCount(trueCount: number): number {
  if (trueCount >= 5) return 8
  if (trueCount >= 4) return 6
  if (trueCount >= 3) return 4
  if (trueCount >= 2) return 2
  return 1
}

/**
 * Approximate player edge from true count. Each +1 TC adds ~0.5% vs a -0.5%
 * baseline at TC 0 — a deliberate rule-of-thumb, not a simulated exact edge.
 */
export function estimatedEdgePercent(trueCount: number): number {
  return BASELINE_HOUSE_EDGE_PERCENT + trueCount * EDGE_SHIFT_PER_TRUE_COUNT
}

export function getCountInterpretation(
  trueCount: number,
  minimumBet: number,
  cardsDealt: number,
): CountInterpretation {
  if (cardsDealt < MIN_CARDS_FOR_HI_LO_INTERPRETATION) {
    return {
      ready: false,
      label: 'Reading the shoe…',
      suggestedBet: minimumBet,
      estimatedEdgePercent: BASELINE_HOUSE_EDGE_PERCENT,
    }
  }

  return {
    ready: true,
    label: countStrengthLabel(trueCount),
    suggestedBet: unitsForTrueCount(trueCount) * minimumBet,
    estimatedEdgePercent: estimatedEdgePercent(trueCount),
  }
}
