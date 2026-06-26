import { describe, expect, it } from 'vitest'
import { SHOE_SIZE } from '../cards/constants'
import { completeHand, createShoe } from '../cards/shoe'
import { HANDS_PER_SHOE } from './constants'
import {
  baccaratReducer,
  canDeal,
  createInitialState,
  isValidBetAmount,
  toSnapshot,
} from './gameLogic'

function deterministicRandom(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]!
    index += 1
    return value
  }
}

describe('bet validation', () => {
  it('requires minimum 5 tadpoles in steps of 5', () => {
    expect(isValidBetAmount(5)).toBe(true)
    expect(isValidBetAmount(10)).toBe(true)
    expect(isValidBetAmount(4)).toBe(false)
    expect(isValidBetAmount(7)).toBe(false)
  })
})

describe('baccaratReducer deal flow', () => {
  it('moves from betting to dealing with a resolved hand', () => {
    let state = createInitialState()
    state = baccaratReducer(state, { type: 'deal', betType: 'player', amount: 10 })

    expect(state.phase).toBe('dealing')
    expect(state.hand).not.toBeNull()
    expect(state.outcome).not.toBeNull()
    expect(state.payout).toBeGreaterThanOrEqual(0)
  })

  it('finish_dealing moves to resolved', () => {
    let state = createInitialState()
    state = baccaratReducer(state, { type: 'deal', betType: 'banker', amount: 10 })
    state = baccaratReducer(state, { type: 'finish_dealing' })
    expect(state.phase).toBe('resolved')
    expect(state.hand).not.toBeNull()
  })

  it('canDeal is true during resolved phase', () => {
    let state = createInitialState()
    state = baccaratReducer(state, { type: 'deal', betType: 'player', amount: 10 })
    state = baccaratReducer(state, { type: 'finish_dealing' })
    expect(state.phase).toBe('resolved')
    expect(canDeal(state)).toBe(true)
  })

  it('deal from resolved closes the previous hand and starts a new one', () => {
    let state = createInitialState()
    state = baccaratReducer(state, { type: 'deal', betType: 'player', amount: 10 })
    const firstOutcome = state.outcome!
    state = baccaratReducer(state, { type: 'finish_dealing' })
    state = baccaratReducer(state, { type: 'deal', betType: 'banker', amount: 10 })

    expect(state.phase).toBe('dealing')
    expect(state.sessionTally[firstOutcome]).toBe(1)
    expect(state.shoe.handsCompleted).toBe(1)
    expect(state.betType).toBe('banker')
  })
})

describe('shoe reshuffle', () => {
  it('reshuffles after exactly 8 completed hands', () => {
    let shoe = createShoe(deterministicRandom([0.5]))
    expect(shoe.handsCompleted).toBe(0)

    for (let hand = 1; hand <= 7; hand += 1) {
      const result = completeHand(shoe, HANDS_PER_SHOE)
      shoe = result.shoe
      expect(shoe.handsCompleted).toBe(hand)
      expect(result.reshuffled).toBe(false)
      expect(shoe.queue.length + shoe.discardPile.length).toBe(SHOE_SIZE)
    }

    const eighth = completeHand(shoe, HANDS_PER_SHOE, deterministicRandom([0.75]))
    shoe = eighth.shoe
    expect(eighth.reshuffled).toBe(true)
    expect(shoe.handsCompleted).toBe(0)
    expect(shoe.queue.length).toBe(SHOE_SIZE)
    expect(shoe.discardPile.length).toBe(0)
  })

  it('does not reshuffle mid-hand via reducer', () => {
    let state = createInitialState()
    for (let i = 0; i < HANDS_PER_SHOE - 1; i += 1) {
      state = baccaratReducer(state, { type: 'deal', betType: 'player', amount: 5 })
      state = baccaratReducer(state, { type: 'finish_dealing' })
      state = baccaratReducer(state, { type: 'next_hand' })
    }

    const cardsBeforeDeal = state.shoe.queue.length + state.shoe.discardPile.length
    state = baccaratReducer(state, { type: 'deal', betType: 'player', amount: 5 })
    const cardsDuringHand = state.shoe.queue.length + state.shoe.discardPile.length

    expect(cardsBeforeDeal).toBe(SHOE_SIZE)
    expect(cardsDuringHand).toBe(SHOE_SIZE)
    expect(state.shoe.handsCompleted).toBe(HANDS_PER_SHOE - 1)
  })
})

describe('toSnapshot', () => {
  it('exposes canDeal during betting', () => {
    const snapshot = toSnapshot(createInitialState())
    expect(snapshot.canDeal).toBe(true)
    expect(snapshot.pendingBet).toBe(5)
  })
})
