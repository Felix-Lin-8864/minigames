import { describe, expect, it } from 'vitest'
import {
  createInsideBet,
  createOutsideBet,
  isValidAdjacency,
  ODDS,
  resolveBet,
  resolveSpin,
  type Bet,
  type BetType,
} from './bets'

describe('isValidAdjacency', () => {
  it('accepts valid splits including 0 splits', () => {
    expect(isValidAdjacency('split', [1, 2])).toBe(true)
    expect(isValidAdjacency('split', [0, 1])).toBe(true)
    expect(isValidAdjacency('split', [0, 2])).toBe(true)
    expect(isValidAdjacency('split', [0, 3])).toBe(true)
    expect(isValidAdjacency('split', [1, 4])).toBe(true)
  })

  it('rejects invalid splits', () => {
    expect(isValidAdjacency('split', [1, 3])).toBe(false)
    expect(isValidAdjacency('split', [1, 5])).toBe(false)
  })

  it('accepts valid streets, corners, and six-lines', () => {
    expect(isValidAdjacency('street', [1, 2, 3])).toBe(true)
    expect(isValidAdjacency('corner', [1, 2, 4, 5])).toBe(true)
    expect(isValidAdjacency('sixline', [1, 2, 3, 4, 5, 6])).toBe(true)
  })

  it('rejects invalid corners and six-lines', () => {
    expect(isValidAdjacency('corner', [1, 2, 3, 4])).toBe(false)
    expect(isValidAdjacency('sixline', [1, 2, 3, 7, 8, 9])).toBe(false)
  })
})

describe('resolveBet', () => {
  const stake = 10

  const insideTypes: { type: BetType; numbers: number[]; winResult: number; loseResult: number }[] = [
    { type: 'straight', numbers: [7], winResult: 7, loseResult: 8 },
    { type: 'split', numbers: [1, 2], winResult: 2, loseResult: 4 },
    { type: 'street', numbers: [1, 2, 3], winResult: 3, loseResult: 7 },
    { type: 'corner', numbers: [1, 2, 4, 5], winResult: 5, loseResult: 7 },
    { type: 'sixline', numbers: [1, 2, 3, 4, 5, 6], winResult: 6, loseResult: 10 },
  ]

  for (const { type, numbers, winResult, loseResult } of insideTypes) {
    it(`pays stake * (odds + 1) for ${type} on win`, () => {
      const bet: Bet = { type, numbers, amount: stake }
      expect(resolveBet(bet, winResult)).toBe(stake * (ODDS[type] + 1))
      expect(resolveBet(bet, loseResult)).toBe(0)
    })
  }

  const outsideTypes: { type: BetType; winResult: number; loseResult: number }[] = [
    { type: 'red', winResult: 1, loseResult: 2 },
    { type: 'black', winResult: 2, loseResult: 1 },
    { type: 'odd', winResult: 1, loseResult: 2 },
    { type: 'even', winResult: 2, loseResult: 1 },
    { type: 'low', winResult: 5, loseResult: 20 },
    { type: 'high', winResult: 20, loseResult: 5 },
    { type: 'dozen1', winResult: 6, loseResult: 15 },
    { type: 'dozen2', winResult: 15, loseResult: 6 },
    { type: 'dozen3', winResult: 30, loseResult: 6 },
    { type: 'column1', winResult: 1, loseResult: 2 },
    { type: 'column2', winResult: 2, loseResult: 1 },
    { type: 'column3', winResult: 3, loseResult: 1 },
  ]

  for (const { type, winResult, loseResult } of outsideTypes) {
    it(`pays stake * (odds + 1) for ${type} on win`, () => {
      const bet = createOutsideBet(type, stake)
      expect(resolveBet(bet, winResult)).toBe(stake * (ODDS[type] + 1))
      expect(resolveBet(bet, loseResult)).toBe(0)
    })
  }

  it('0 loses all outside bets', () => {
    const outside: BetType[] = [
      'red', 'black', 'odd', 'even', 'low', 'high',
      'dozen1', 'dozen2', 'dozen3', 'column1', 'column2', 'column3',
    ]
    for (const type of outside) {
      const bet = createOutsideBet(type, stake)
      expect(resolveBet(bet, 0)).toBe(0)
    }
  })

  it('straight-up on 0 wins only when result is 0', () => {
    const bet = createInsideBet('straight', [0], stake)!
    expect(resolveBet(bet, 0)).toBe(stake * 36)
    expect(resolveBet(bet, 1)).toBe(0)
  })
})

describe('resolveSpin', () => {
  it('resolves multiple bets independently against one result', () => {
    const bets: Bet[] = [
      createInsideBet('straight', [7], 5)!,
      createOutsideBet('red', 10),
      createOutsideBet('odd', 15),
    ]
    const resolution = resolveSpin(bets, 7)
    expect(resolution.outcomes).toHaveLength(3)
    expect(resolution.outcomes[0]!.won).toBe(true)
    expect(resolution.outcomes[0]!.payout).toBe(5 * 36)
    expect(resolution.outcomes[1]!.won).toBe(true)
    expect(resolution.outcomes[1]!.payout).toBe(20)
    expect(resolution.outcomes[2]!.won).toBe(true)
    expect(resolution.outcomes[2]!.payout).toBe(30)
    expect(resolution.totalStaked).toBe(30)
    expect(resolution.totalPayout).toBe(5 * 36 + 20 + 30)
    expect(resolution.net).toBe(resolution.totalPayout - 30)
  })

  it('mixed win/loss on same spin', () => {
    const bets: Bet[] = [
      createInsideBet('straight', [7], 5)!,
      createOutsideBet('black', 10),
    ]
    const resolution = resolveSpin(bets, 7)
    expect(resolution.outcomes[0]!.won).toBe(true)
    expect(resolution.outcomes[1]!.won).toBe(false)
    expect(resolution.totalPayout).toBe(5 * 36)
    expect(resolution.net).toBe(5 * 36 - 15)
  })
})
