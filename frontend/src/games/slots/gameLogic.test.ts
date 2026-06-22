import { describe, expect, it } from 'vitest'
import { MIN_BET, PARTIAL_PAYOUTS, PAYOUTS, SLOT_SYMBOLS, SYMBOL_WEIGHTS } from './constants'
import {
  DEFAULT_CONFIG,
  createInitialState,
  evaluateSpin,
  slotsReducer,
  spinReel,
  spinReels,
  theoreticalRtp,
} from './gameLogic'
import type { SlotSymbol } from './types'

function deterministicRandom(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]!
    index += 1
    return value
  }
}

describe('spinReel', () => {
  it('selects symbols according to weight buckets', () => {
    const total = SYMBOL_WEIGHTS.reduce((a, b) => a + b, 0)
    // r * total in [0, 30) -> fly
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 0)).toBe('fly')
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 29.9 / total)).toBe('fly')
    // [30, 54) -> reed
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 30.1 / total)).toBe('reed')
    // [54, 72) -> droplet
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 54.1 / total)).toBe('droplet')
    // [72, 84) -> lilypad
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 72.1 / total)).toBe('lilypad')
    // [84, 92) -> caterpillar
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 84.1 / total)).toBe('caterpillar')
    // [92, 97) -> egg
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 92.1 / total)).toBe('egg')
    // [97, 100) -> goldenfrog
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 97.1 / total)).toBe('goldenfrog')
  })

  it('falls back to last symbol on floating-point edge', () => {
    expect(spinReel(SLOT_SYMBOLS, SYMBOL_WEIGHTS, () => 0.9999999999)).toBe('goldenfrog')
  })
})

describe('spinReels', () => {
  it('spins three reels independently', () => {
    const random = deterministicRandom([0, 31 / 100, 98 / 100])
    expect(spinReels(DEFAULT_CONFIG, random)).toEqual(['fly', 'reed', 'goldenfrog'])
  })
})

describe('evaluateSpin', () => {
  const bet = 10

  it.each(SLOT_SYMBOLS)('returns bet * multiplier for three %s', (symbol) => {
    const reels: [SlotSymbol, SlotSymbol, SlotSymbol] = [symbol, symbol, symbol]
    const multiplier = PAYOUTS[symbol]
    const result = evaluateSpin(reels, bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(bet * multiplier)
    expect(result.multiplier).toBe(multiplier)
    expect(result.matchKind).toBe('three')
    expect(result.winningSymbol).toBe(symbol)
    expect(result.reels).toEqual(reels)
  })

  it('returns zero payout for mixed symbols', () => {
    const result = evaluateSpin(['fly', 'reed', 'droplet'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(0)
    expect(result.multiplier).toBe(0)
    expect(result.matchKind).toBe('none')
  })

  it('returns zero payout for two-of-a-kind on common symbols', () => {
    const result = evaluateSpin(['fly', 'fly', 'reed'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(0)
    expect(result.multiplier).toBe(0)
    expect(result.matchKind).toBe('none')
  })

  it('returns partial payout for two caterpillars', () => {
    const result = evaluateSpin(['caterpillar', 'caterpillar', 'fly'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(bet * 3)
    expect(result.multiplier).toBe(3)
    expect(result.matchKind).toBe('two')
    expect(result.winningSymbol).toBe('caterpillar')
  })

  it('returns partial payout for two frog eggs', () => {
    const result = evaluateSpin(['reed', 'egg', 'egg'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(bet * 5)
    expect(result.multiplier).toBe(5)
    expect(result.matchKind).toBe('two')
    expect(result.winningSymbol).toBe('egg')
  })

  it('returns partial payout for two golden frogs', () => {
    const result = evaluateSpin(['goldenfrog', 'fly', 'goldenfrog'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(bet * 8)
    expect(result.multiplier).toBe(8)
    expect(result.matchKind).toBe('two')
    expect(result.winningSymbol).toBe('goldenfrog')
  })

  it('prefers three-of-a-kind over partial payout', () => {
    const result = evaluateSpin(['egg', 'egg', 'egg'], bet, PAYOUTS, PARTIAL_PAYOUTS)
    expect(result.payout).toBe(bet * PAYOUTS.egg)
    expect(result.matchKind).toBe('three')
  })
})

describe('theoreticalRtp', () => {
  it('includes three-of-a-kind and partial two-of-a-kind contributions', () => {
    const rtp = theoreticalRtp(DEFAULT_CONFIG)
    expect(rtp).toBeCloseTo(0.258, 2)
  })
})

describe('slotsReducer', () => {
  it('sets bet only in idle phase', () => {
    let state = createInitialState()
    state = slotsReducer(state, { type: 'set_bet', bet: 25 })
    expect(state.pendingBet).toBe(25)

    state = slotsReducer(state, {
      type: 'spin',
      bet: 25,
      reels: ['fly', 'fly', 'fly'],
      payout: 50,
      multiplier: 2,
      matchKind: 'three',
      winningSymbol: 'fly',
    })
    state = slotsReducer(state, { type: 'set_bet', bet: 10 })
    expect(state.pendingBet).toBe(25)
  })

  it('rejects spin while spinning', () => {
    let state = createInitialState()
    state = slotsReducer(state, {
      type: 'spin',
      bet: MIN_BET,
      reels: ['fly', 'fly', 'fly'],
      payout: 10,
      multiplier: 2,
      matchKind: 'three',
      winningSymbol: 'fly',
    })
    expect(state.phase).toBe('spinning')

    state = slotsReducer(state, {
      type: 'spin',
      bet: MIN_BET,
      reels: ['reed', 'reed', 'reed'],
      payout: 15,
      multiplier: 3,
      matchKind: 'three',
      winningSymbol: 'reed',
    })
    expect(state.reels).toEqual(['fly', 'fly', 'fly'])
  })

  it('runs a full spin cycle', () => {
    let state = createInitialState()
    state = slotsReducer(state, {
      type: 'spin',
      bet: 5,
      reels: ['goldenfrog', 'goldenfrog', 'goldenfrog'],
      payout: 500,
      multiplier: 100,
      matchKind: 'three',
      winningSymbol: 'goldenfrog',
    })
    expect(state.phase).toBe('spinning')
    expect(state.bet).toBe(5)
    expect(state.payout).toBe(500)

    state = slotsReducer(state, { type: 'complete_spin' })
    expect(state.phase).toBe('revealed')
    expect(state.resolutionId).toBe(1)

    state = slotsReducer(state, {
      type: 'spin',
      bet: 5,
      reels: ['fly', 'reed', 'droplet'],
      payout: 0,
      multiplier: 0,
      matchKind: 'none',
      winningSymbol: null,
    })
    expect(state.phase).toBe('spinning')
  })

  it('rejects bets under MIN_BET', () => {
    let state = createInitialState()
    state = slotsReducer(state, { type: 'set_bet', bet: MIN_BET - 1 })
    expect(state.pendingBet).toBe(MIN_BET)
  })
})

describe('RTP simulation', () => {
  it('observed RTP over 100k spins is within ±2% of theoretical', () => {
    const spins = 100_000
    const bet = 5
    let totalWagered = 0
    let totalPayout = 0

    for (let i = 0; i < spins; i += 1) {
      const reels = spinReels(DEFAULT_CONFIG)
      const { payout } = evaluateSpin(reels, bet, PAYOUTS, PARTIAL_PAYOUTS)
      totalWagered += bet
      totalPayout += payout
    }

    const observedRtp = totalPayout / totalWagered
    const targetRtp = theoreticalRtp(DEFAULT_CONFIG)

    expect(observedRtp).toBeGreaterThanOrEqual(targetRtp - 0.02)
    expect(observedRtp).toBeLessThanOrEqual(targetRtp + 0.02)
  })
})
