import { describe, expect, it } from 'vitest'
import { createInsideBet, createOutsideBet } from './bets'
import { MIN_BET } from './constants'
import {
  createInitialState,
  rouletteReducer,
  totalStaked,
} from './gameLogic'

describe('rouletteReducer place_bet', () => {
  it('rejects wagers under MIN_BET', () => {
    let state = createInitialState()
    const bet = createInsideBet('straight', [7], MIN_BET - 1)
    expect(bet).not.toBeNull()
    state = rouletteReducer(state, { type: 'place_bet', bet: bet! })
    expect(state.pendingBets).toHaveLength(0)
  })

  it('accepts valid bets at MIN_BET', () => {
    let state = createInitialState()
    const bet = createInsideBet('straight', [7], MIN_BET)!
    state = rouletteReducer(state, { type: 'place_bet', bet })
    expect(state.pendingBets).toHaveLength(1)
    expect(totalStaked(state)).toBe(MIN_BET)
  })

  it('rejects invalid adjacency', () => {
    let state = createInitialState()
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: { type: 'split', numbers: [1, 3], amount: MIN_BET },
    })
    expect(state.pendingBets).toHaveLength(0)
  })
})

describe('rouletteReducer spin flow', () => {
  it('runs a full round with deterministic spin result', () => {
    let state = createInitialState()
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [7], 5)!,
    })
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createOutsideBet('red', 10),
    })
    state = rouletteReducer(state, { type: 'spin', spinResult: 7 })

    expect(state.phase).toBe('revealing')
    expect(state.spinResult).toBe(7)
    expect(state.betOutcomes).toHaveLength(2)
    expect(state.betOutcomes![0]!.won).toBe(true)
    expect(state.lastSpinNet).toBe(5 * 36 + 20 - 15)

    state = rouletteReducer(state, { type: 'complete_round' })
    expect(state.phase).toBe('betting')
    expect(state.pendingBets).toHaveLength(0)
    expect(state.recentSpins).toEqual([7])
    expect(state.lastRoundBets).toHaveLength(2)
  })

  it('does not spin with no bets', () => {
    let state = createInitialState()
    state = rouletteReducer(state, { type: 'spin', spinResult: 5 })
    expect(state.phase).toBe('betting')
    expect(state.spinResult).toBeNull()
  })

  it('caps recent spins at RECENT_SPINS_LIMIT', () => {
    let state = createInitialState()
    for (let i = 1; i <= 15; i += 1) {
      state = rouletteReducer(state, {
        type: 'place_bet',
        bet: createInsideBet('straight', [i % 37], MIN_BET)!,
      })
      state = rouletteReducer(state, { type: 'spin', spinResult: i % 37 })
      state = rouletteReducer(state, { type: 'complete_round' })
    }
    expect(state.recentSpins.length).toBeLessThanOrEqual(12)
  })
})

describe('rouletteReducer multiplier', () => {
  it('applies boost cost and multiplier on winning boosted pocket', () => {
    let state = createInitialState()
    state = rouletteReducer(state, { type: 'set_boost_amount', amount: 5 })
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [7], 5)!,
    })
    state = rouletteReducer(state, { type: 'spin', spinResult: 7, boostedPocket: 7 })

    expect(state.boostedPocket).toBe(7)
    expect(state.multiplierHit).toBe(true)
    expect(state.betOutcomes![0]!.payout).toBe(5 * 36 * 5)
    expect(state.lastSpinNet).toBe(5 * 36 * 5 - 5 - 5)
  })

  it('does not assign boosted pocket during betting', () => {
    let state = createInitialState()
    state = rouletteReducer(state, { type: 'set_boost_amount', amount: 10 })
    expect(state.boostedPocket).toBeNull()
  })
})

describe('rouletteReducer rebet', () => {
  it('restores last round bets', () => {
    let state = createInitialState()
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [7], MIN_BET)!,
    })
    state = rouletteReducer(state, { type: 'spin', spinResult: 1 })
    state = rouletteReducer(state, { type: 'complete_round' })
    expect(state.pendingBets).toHaveLength(0)

    state = rouletteReducer(state, { type: 'rebet' })
    expect(state.pendingBets).toHaveLength(1)
    expect(state.pendingBets[0]!.numbers).toEqual([7])
  })
})

describe('rouletteReducer clear and remove', () => {
  it('clears bets during betting phase', () => {
    let state = createInitialState()
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [1], MIN_BET)!,
    })
    state = rouletteReducer(state, { type: 'clear_bets' })
    expect(state.pendingBets).toHaveLength(0)
  })

  it('removes bet by index', () => {
    let state = createInitialState()
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [1], MIN_BET)!,
    })
    state = rouletteReducer(state, {
      type: 'place_bet',
      bet: createInsideBet('straight', [2], MIN_BET)!,
    })
    state = rouletteReducer(state, { type: 'remove_bet', index: 0 })
    expect(state.pendingBets).toHaveLength(1)
    expect(state.pendingBets[0]!.numbers).toEqual([2])
  })
})
