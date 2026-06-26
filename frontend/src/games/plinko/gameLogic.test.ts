import { describe, expect, it } from 'vitest'
import { MIN_BET, MULTIPLIERS, ROWS, SLOT_COUNT } from './constants'
import {
  DEFAULT_CONFIG,
  createInitialState,
  evaluateDrop,
  plinkoReducer,
  simulateDrop,
  theoreticalRtp,
} from './gameLogic'
import type { RiskTier } from './types'

function deterministicRandom(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]!
    index += 1
    return value
  }
}

const RISK_TIERS: RiskTier[] = ['low', 'medium', 'high']

describe('simulateDrop', () => {
  it('returns a path of length equal to rows', () => {
    const { path } = simulateDrop(ROWS)
    expect(path).toHaveLength(ROWS)
  })

  it('returns slot equal to the final path position', () => {
    const { path, slot } = simulateDrop(ROWS)
    expect(slot).toBe(path[path.length - 1])
  })

  it('keeps each path step within valid bounds for that row', () => {
    const { path } = simulateDrop(ROWS)
    path.forEach((position, rowIndex) => {
      expect(position).toBeGreaterThanOrEqual(0)
      expect(position).toBeLessThanOrEqual(rowIndex + 1)
    })
  })

  it('returns slot in range 0–12', () => {
    for (let i = 0; i < 200; i += 1) {
      const { slot } = simulateDrop(ROWS)
      expect(slot).toBeGreaterThanOrEqual(0)
      expect(slot).toBeLessThanOrEqual(ROWS)
    }
  })

  it('follows injected random values', () => {
    const random = deterministicRandom([0.1, 0.9, 0.1, 0.9, 0.1, 0.9, 0.1, 0.9, 0.1, 0.9, 0.1, 0.9])
    const { path, slot } = simulateDrop(ROWS, random)
    expect(path).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6])
    expect(slot).toBe(6)
  })
})

describe('evaluateDrop', () => {
  const bet = 10

  it.each(RISK_TIERS)('returns bet * multiplier for %s risk', (risk) => {
    for (let slot = 0; slot < SLOT_COUNT; slot += 1) {
      const multiplier = MULTIPLIERS[risk][slot]!
      const path = Array.from({ length: ROWS }, () => slot)
      const result = evaluateDrop(slot, bet, risk, DEFAULT_CONFIG, path)
      expect(result.payout).toBe(bet * multiplier)
      expect(result.multiplier).toBe(multiplier)
      expect(result.slot).toBe(slot)
      expect(result.path).toEqual(path)
    }
  })
})

describe('theoreticalRtp', () => {
  it.each(RISK_TIERS)('%s risk targets ~15%% RTP', (risk) => {
    expect(theoreticalRtp(risk)).toBeCloseTo(0.15, 2)
  })
})

describe('plinkoReducer', () => {
  it('updates pending bet regardless of active drops', () => {
    let state = createInitialState()
    state = plinkoReducer(state, { type: 'set_bet', bet: 25 })
    expect(state.pendingBet).toBe(25)

    state = plinkoReducer(state, {
      type: 'drop',
      id: 1,
      bet: 25,
      risk: 'low',
      path: Array(ROWS).fill(6),
      slot: 6,
      payout: 2,
      multiplier: 0.08,
    })
    state = plinkoReducer(state, { type: 'set_bet', bet: 10 })
    expect(state.pendingBet).toBe(10)
  })

  it('allows risk changes with active drops', () => {
    let state = createInitialState()
    state = plinkoReducer(state, {
      type: 'drop',
      id: 1,
      bet: MIN_BET,
      risk: 'low',
      path: Array(ROWS).fill(0),
      slot: 0,
      payout: 2.5,
      multiplier: 2.5,
    })
    state = plinkoReducer(state, { type: 'set_risk', risk: 'high' })
    expect(state.risk).toBe('high')
    expect(state.activeDrops).toHaveLength(1)
    expect(state.activeDrops[0]!.risk).toBe('low')
  })

  it('allows multiple concurrent drops', () => {
    let state = createInitialState()
    state = plinkoReducer(state, {
      type: 'drop',
      id: 1,
      bet: MIN_BET,
      risk: 'low',
      path: Array(ROWS).fill(0),
      slot: 0,
      payout: 2.5,
      multiplier: 2.5,
    })

    state = plinkoReducer(state, {
      type: 'drop',
      id: 2,
      bet: MIN_BET,
      risk: 'high',
      path: Array(ROWS).fill(12),
      slot: 12,
      payout: 82,
      multiplier: 82,
    })

    expect(state.activeDrops).toHaveLength(2)
    expect(state.activeDrops[0]!.slot).toBe(0)
    expect(state.activeDrops[1]!.slot).toBe(12)
  })

  it('removes only the matching drop on complete_drop', () => {
    let state = createInitialState()
    state = plinkoReducer(state, {
      type: 'drop',
      id: 1,
      bet: 5,
      risk: 'medium',
      path: Array(ROWS).fill(6),
      slot: 6,
      payout: 0.1,
      multiplier: 0.02,
    })
    state = plinkoReducer(state, {
      type: 'drop',
      id: 2,
      bet: 5,
      risk: 'medium',
      path: Array(ROWS).fill(0),
      slot: 0,
      payout: 100,
      multiplier: 20,
    })

    state = plinkoReducer(state, { type: 'complete_drop', id: 1 })
    expect(state.activeDrops).toHaveLength(1)
    expect(state.activeDrops[0]!.id).toBe(2)
    expect(state.sessionNet).toBeCloseTo(0.1 - 5)
  })

  it('accumulates session net across completed drops', () => {
    let state = createInitialState()
    state = plinkoReducer(state, {
      type: 'drop',
      id: 1,
      bet: 10,
      risk: 'low',
      path: Array(ROWS).fill(0),
      slot: 0,
      payout: 25,
      multiplier: 2.5,
    })
    state = plinkoReducer(state, { type: 'complete_drop', id: 1 })
    expect(state.sessionNet).toBe(15)

    state = plinkoReducer(state, {
      type: 'drop',
      id: 2,
      bet: 5,
      risk: 'low',
      path: Array(ROWS).fill(6),
      slot: 6,
      payout: 0.4,
      multiplier: 0.08,
    })
    state = plinkoReducer(state, { type: 'complete_drop', id: 2 })
    expect(state.sessionNet).toBeCloseTo(10.4)
  })

  it('rejects bets under MIN_BET', () => {
    let state = createInitialState()
    state = plinkoReducer(state, { type: 'set_bet', bet: MIN_BET - 1 })
    expect(state.pendingBet).toBe(MIN_BET)
  })

  it('accepts MIN_BET of 1', () => {
    let state = createInitialState()
    state = plinkoReducer(state, { type: 'set_bet', bet: 1 })
    expect(state.pendingBet).toBe(1)
  })
})

describe('RTP simulation', () => {
  it.each(RISK_TIERS)(
    'observed RTP over 100k drops for %s is within ±2%% of theoretical',
    (risk) => {
      const spins = 100_000
      const bet = 5
      let totalWagered = 0
      let totalPayout = 0

      for (let i = 0; i < spins; i += 1) {
        const { slot } = simulateDrop(ROWS)
        const { payout } = evaluateDrop(slot, bet, risk)
        totalWagered += bet
        totalPayout += payout
      }

      const observedRtp = totalPayout / totalWagered
      const targetRtp = theoreticalRtp(risk)

      expect(observedRtp).toBeGreaterThanOrEqual(targetRtp - 0.02)
      expect(observedRtp).toBeLessThanOrEqual(targetRtp + 0.02)
    },
  )
})
