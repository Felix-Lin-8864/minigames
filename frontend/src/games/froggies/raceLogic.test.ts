import { describe, expect, it } from 'vitest'
import { FROGS } from './constants'
import {
  buildBet,
  createInitialPositions,
  evaluateBet,
  getMultiplier,
  getSlotCount,
  getWinProbability,
  resolveFinishOrder,
  runRace,
  tickRace,
} from './raceLogic'
import type { BetType, FrogColour } from './types'

describe('getMultiplier', () => {
  it('returns correct multipliers for each bet type', () => {
    expect(getMultiplier('win')).toBe(4)
    expect(getMultiplier('exacta')).toBe(16)
    expect(getMultiplier('trifecta')).toBe(48)
    expect(getMultiplier('superfecta')).toBe(96)
    expect(getMultiplier('fullhouse')).toBe(96)
  })

  it('returns the same multiplier for superfecta and fullhouse', () => {
    expect(getMultiplier('superfecta')).toBe(getMultiplier('fullhouse'))
  })
})

describe('getSlotCount and getWinProbability', () => {
  it('maps bet types to slot counts', () => {
    expect(getSlotCount('win')).toBe(1)
    expect(getSlotCount('exacta')).toBe(2)
    expect(getSlotCount('trifecta')).toBe(3)
    expect(getSlotCount('superfecta')).toBe(4)
    expect(getSlotCount('fullhouse')).toBe(5)
  })

  it('maps bet types to win probabilities', () => {
    expect(getWinProbability('win')).toBeCloseTo(0.2)
    expect(getWinProbability('exacta')).toBeCloseTo(0.05)
    expect(getWinProbability('trifecta')).toBeCloseTo(1 / 60)
    expect(getWinProbability('superfecta')).toBeCloseTo(1 / 120)
    expect(getWinProbability('fullhouse')).toBeCloseTo(1 / 120)
  })
})

describe('tickRace', () => {
  it('advances exactly one random frog by one square', () => {
    const next = tickRace(createInitialPositions(), () => 0)
    expect(next.green).toBe(1)
    expect(next.blue).toBe(0)
    expect(next.red).toBe(0)
    expect(next.yellow).toBe(0)
    expect(next.purple).toBe(0)
  })
})

describe('resolveFinishOrder', () => {
  it('ranks frogs by position descending', () => {
    const positions = {
      green: 100,
      blue: 80,
      red: 90,
      yellow: 70,
      purple: 60,
    }
    expect(resolveFinishOrder(positions, () => 0)).toEqual([
      'green',
      'red',
      'blue',
      'yellow',
      'purple',
    ])
  })

  it('uses random tiebreak when positions are equal', () => {
    const positions = {
      green: 10,
      blue: 10,
      red: 10,
      yellow: 10,
      purple: 10,
    }
    const winners = new Set<FrogColour>()
    for (let i = 0; i < 500; i++) {
      winners.add(resolveFinishOrder(positions)[0]!)
    }
    expect(winners.size).toBeGreaterThanOrEqual(3)
  })
})

describe('evaluateBet', () => {
  const finishOrder: FrogColour[] = ['green', 'blue', 'red', 'yellow', 'purple']
  const result = { finishOrder }

  it('returns amount * multiplier for winning bets', () => {
    expect(
      evaluateBet(buildBet('win', ['green'], 10), result),
    ).toBe(40)
    expect(
      evaluateBet(buildBet('exacta', ['green', 'blue'], 10), result),
    ).toBe(160)
    expect(
      evaluateBet(buildBet('trifecta', ['green', 'blue', 'red'], 10), result),
    ).toBe(480)
    expect(
      evaluateBet(
        buildBet('superfecta', ['green', 'blue', 'red', 'yellow'], 10),
        result,
      ),
    ).toBe(960)
    expect(
      evaluateBet(buildBet('fullhouse', finishOrder, 10), result),
    ).toBe(960)
  })

  it('returns 0 when exacta order does not match', () => {
    expect(
      evaluateBet(buildBet('exacta', ['green', 'red'], 10), result),
    ).toBe(0)
    expect(
      evaluateBet(buildBet('exacta', ['blue', 'green'], 10), result),
    ).toBe(0)
  })

  it('returns 0 when full house has a single transposition', () => {
    const transposed: FrogColour[] = ['green', 'red', 'blue', 'yellow', 'purple']
    expect(
      evaluateBet(buildBet('fullhouse', finishOrder, 10), {
        finishOrder: transposed,
      }),
    ).toBe(0)
  })

  it('returns 0 for losing win bets', () => {
    expect(evaluateBet(buildBet('win', ['blue'], 10), result)).toBe(0)
  })
})

describe('runRace', () => {
  it('terminates when any frog reaches the finish position or beyond', () => {
    let call = 0
    const random = () => {
      call += 1
      return 0.99
    }

    const { tickHistory, finishOrder } = runRace(random)
    const finalPositions = tickHistory[tickHistory.length - 1]!
    expect(Math.max(...FROGS.map((frog) => finalPositions[frog]))).toBeGreaterThanOrEqual(39)
    expect(finishOrder).toHaveLength(5)
    expect(new Set(finishOrder).size).toBe(5)
    expect(call).toBeGreaterThan(0)
  })
})

describe('win-rate simulation', () => {
  it('each frog wins approximately 20% of races over 100k simulations', () => {
    const races = 100_000
    const wins: Record<FrogColour, number> = {
      green: 0,
      blue: 0,
      red: 0,
      yellow: 0,
      purple: 0,
    }

    for (let i = 0; i < races; i += 1) {
      const { finishOrder } = runRace()
      wins[finishOrder[0]!] += 1
    }

    for (const frog of FROGS) {
      const rate = wins[frog] / races
      expect(rate).toBeGreaterThanOrEqual(0.18)
      expect(rate).toBeLessThanOrEqual(0.22)
    }
  })
})
