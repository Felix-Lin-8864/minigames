import { describe, expect, it } from 'vitest'
import { aggregatePendingBets, formatBetSummary } from './betLabels'
import { createInsideBet, createOutsideBet } from './bets'

describe('formatBetSummary', () => {
  it('labels inside and outside bets', () => {
    expect(formatBetSummary(createInsideBet('straight', [7], 5)!)).toBe('Straight 7')
    expect(formatBetSummary(createInsideBet('split', [7, 10], 5)!)).toBe('Split 7–10')
    expect(formatBetSummary(createOutsideBet('red', 5))).toBe('Red')
    expect(formatBetSummary(createOutsideBet('dozen1', 5))).toBe('1st 12')
  })
})

describe('aggregatePendingBets', () => {
  it('combines amounts for the same zone', () => {
    const bets = [
      createInsideBet('split', [1, 2], 5)!,
      createInsideBet('split', [1, 2], 10)!,
      createInsideBet('straight', [7], 5)!,
    ]
    const aggregated = aggregatePendingBets(bets)
    expect(aggregated).toHaveLength(2)
    const split = aggregated.find((entry) => entry.bet.type === 'split')
    expect(split?.total).toBe(15)
  })
})
