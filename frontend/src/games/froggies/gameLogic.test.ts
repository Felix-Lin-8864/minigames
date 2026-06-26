import { describe, expect, it } from 'vitest'
import { MIN_BET } from './constants'
import {
  canStartRace,
  createBetOutcome,
  createInitialState,
  froggiesReducer,
  isValidBetAmount,
} from './gameLogic'
import type { FrogPositions } from './types'

const sampleHistory: FrogPositions[] = [
  { green: 2, blue: 1, red: 3, yellow: 0, purple: 2 },
  { green: 4, blue: 3, red: 5, yellow: 2, purple: 4 },
]

const finishOrder = ['green', 'blue', 'red', 'yellow', 'purple'] as const
const betOutcome = createBetOutcome(MIN_BET, 0)

describe('createInitialState', () => {
  it('starts in betting phase with default win bet', () => {
    const state = createInitialState()
    expect(state.phase).toBe('betting')
    expect(state.betType).toBe('win')
    expect(state.betAmount).toBe(MIN_BET)
    expect(state.selection).toEqual([null, null, null, null, null])
  })
})

describe('isValidBetAmount', () => {
  it('accepts MIN_BET and multiples of BET_STEP', () => {
    expect(isValidBetAmount(5)).toBe(true)
    expect(isValidBetAmount(10)).toBe(true)
  })

  it('rejects amounts below MIN_BET or off-step', () => {
    expect(isValidBetAmount(4)).toBe(false)
    expect(isValidBetAmount(7)).toBe(false)
  })
})

describe('froggiesReducer', () => {
  it('updates bet type and clears unused slots', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'green' })
    state = froggiesReducer(state, { type: 'set_slot', index: 1, frog: 'blue' })
    state = froggiesReducer(state, { type: 'set_bet_type', betType: 'win' })

    expect(state.betType).toBe('win')
    expect(state.selection[0]).toBe('green')
    expect(state.selection[1]).toBeNull()
  })

  it('prevents duplicate frogs in active slots', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_bet_type', betType: 'exacta' })
    state = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'green' })
    state = froggiesReducer(state, { type: 'set_slot', index: 1, frog: 'green' })

    expect(state.selection[0]).toBeNull()
    expect(state.selection[1]).toBe('green')
  })

  it('rejects bets under MIN_BET', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_bet_amount', amount: MIN_BET - 1 })
    expect(state.betAmount).toBe(MIN_BET)
  })

  it('starts race only with complete selection and valid amount', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'green' })
    expect(canStartRace(state)).toBe(true)

    state = froggiesReducer(state, {
      type: 'start_race',
      tickHistory: sampleHistory,
      finishOrder: [...finishOrder],
      betOutcome,
    })

    expect(state.phase).toBe('racing')
    expect(state.tickHistory).toHaveLength(2)
    expect(state.animationTick).toBe(0)
  })

  it('locks betting changes after race starts', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'green' })
    state = froggiesReducer(state, {
      type: 'start_race',
      tickHistory: sampleHistory,
      finishOrder: [...finishOrder],
      betOutcome,
    })

    const locked = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'blue' })
    expect(locked.selection[0]).toBe('green')

    const lockedAmount = froggiesReducer(state, { type: 'set_bet_amount', amount: 20 })
    expect(lockedAmount.betAmount).toBe(MIN_BET)
  })

  it('transitions racing to resolved and back to betting', () => {
    let state = createInitialState()
    state = froggiesReducer(state, { type: 'set_slot', index: 0, frog: 'green' })
    state = froggiesReducer(state, {
      type: 'start_race',
      tickHistory: sampleHistory,
      finishOrder: [...finishOrder],
      betOutcome,
    })
    state = froggiesReducer(state, { type: 'set_animation_tick', tick: 1 })
    state = froggiesReducer(state, { type: 'complete_race' })

    expect(state.phase).toBe('resolved')

    state = froggiesReducer(state, { type: 'new_race' })
    expect(state.phase).toBe('betting')
    expect(state.betAmount).toBe(MIN_BET)
    expect(state.selection[0]).toBe('green')
    expect(state.tickHistory).toBeNull()
  })
})
