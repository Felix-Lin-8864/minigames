import { describe, expect, it } from 'vitest'
import { getOptimalMove } from './basicStrategy'
import { createCard } from './cards'
import { CARD_VALUE_KEYS, HANDS_PER_SHOE, MIN_BET, SHOE_SIZE } from './constants'
import { createInitialState, twentyOneReducer, toSnapshot } from './gameLogic'
import { fisherYatesShuffle } from './shuffle'
import * as shoeModule from './shoe'
import * as shuffleModule from './shuffle'
import {
  assertShoeIntegrity,
  cardProbabilities,
  completeHand,
  createShoe,
  dealCard,
  revealCard,
  runningCountFromDiscard,
  totalRemaining,
} from './shoe'

function deterministicRandom(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]!
    index += 1
    return value
  }
}

describe('shoe management', () => {
  it('starts with exactly 312 cards', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    expect(shoe.queue.length).toBe(SHOE_SIZE)
    expect(shoe.discardPile.length).toBe(0)
    expect(totalRemaining(shoe)).toBe(SHOE_SIZE)
    assertShoeIntegrity(shoe)
  })

  it('deals from the front of the queue without using Math.random at deal time', () => {
    const shoe = createShoe(deterministicRandom([0.1, 0.2, 0.3]))
    const first = shoe.queue[0]!
    const dealt = dealCard(shoe)
    expect(dealt.rank).toBe(first.rank)
    expect(dealt.suit).toBe(first.suit)
    expect(shoe.queue.length).toBe(SHOE_SIZE - 1)
    expect(shoe.discardPile.length).toBe(1)
  })

  it('reshuffles exactly every 5 completed hands', () => {
    let shoe = createShoe(deterministicRandom([0.5]))
    expect(shoe.handsCompleted).toBe(0)

    for (let hand = 1; hand <= 4; hand += 1) {
      const result = completeHand(shoe, deterministicRandom([0.25]))
      shoe = result.shoe
      expect(shoe.handsCompleted).toBe(hand)
      expect(shoe.queue.length + shoe.discardPile.length).toBe(SHOE_SIZE)
      expect(result.reshuffled).toBe(false)
    }

    const fifth = completeHand(shoe, deterministicRandom([0.75]))
    shoe = fifth.shoe
    expect(fifth.reshuffled).toBe(true)
    expect(shoe.handsCompleted).toBe(0)
    expect(shoe.queue.length).toBe(SHOE_SIZE)
    expect(shoe.discardPile.length).toBe(0)
    expect(shoe.runningCount).toBe(0)
  })

  it('resets Hi-Lo running count on reshuffle', () => {
    let shoe = createShoe(deterministicRandom([0.5]))
    dealCard(shoe)
    dealCard(shoe)
    expect(shoe.runningCount).not.toBe(0)

    for (let i = 0; i < HANDS_PER_SHOE; i += 1) {
      const result = completeHand(shoe, deterministicRandom([0.5]))
      shoe = result.shoe
    }
    expect(shoe.runningCount).toBe(0)
  })

  it('does not count the dealer hole card until revealed', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    const hole = dealCard(shoe, false)
    const countBefore = runningCountFromDiscard(shoe)
    revealCard(shoe, hole)
    expect(runningCountFromDiscard(shoe)).not.toBe(countBefore)
  })

  it('derives running count from the full discard pile across the shoe era', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    dealCard(shoe)
    dealCard(shoe)
    dealCard(shoe, false)
    expect(shoe.runningCount).toBe(runningCountFromDiscard(shoe))
    expect(runningCountFromDiscard(shoe)).not.toBe(0)
  })

  it('detects when a shoe era ends and a fresh queue begins', () => {
    const { didShoeJustReshuffle } = shoeModule
    expect(didShoeJustReshuffle(null, 0)).toBe(false)
    expect(didShoeJustReshuffle(0, 0)).toBe(false)
    expect(didShoeJustReshuffle(24, 0)).toBe(true)
    expect(didShoeJustReshuffle(24, 3)).toBe(false)
  })
})

describe('card probabilities', () => {
  it('percentages across all 10 values sum to 100% within tolerance', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    for (let i = 0; i < 40; i += 1) {
      dealCard(shoe)
    }
    const probs = cardProbabilities(shoe)
    const sum = CARD_VALUE_KEYS.reduce((total, key) => total + probs[key], 0)
    expect(sum).toBeCloseTo(100, 5)
  })
})

describe('basic strategy', () => {
  it('never returns insurance or surrender', () => {
    const hands = [
      [createCard('spades', 'A'), createCard('hearts', 'K')],
      [createCard('clubs', '8'), createCard('diamonds', '8')],
      [createCard('hearts', '5'), createCard('clubs', '6')],
      [createCard('spades', 'A'), createCard('diamonds', '6')],
    ]
    const dealerCards: Array<typeof hands[0][0]['rank']> = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A',
    ]

    for (const cards of hands) {
      for (const dealer of dealerCards) {
        const move = getOptimalMove(cards, dealer, true, true)
        expect(['hit', 'stand', 'double', 'split']).toContain(move)
        expect(move).not.toMatch(/insurance|surrender/i)
      }
    }
  })
})

describe('randomness isolation', () => {
  it('uses Math.random only inside shuffle.ts', () => {
    expect(String(shoeModule.dealCard)).not.toContain('Math.random')
    expect(String(shoeModule.createShoe)).not.toContain('Math.random')
    expect(String(shuffleModule.shuffleShoePool)).toContain('Math.random')
  })
})

describe('fisherYatesShuffle', () => {
  it('only uses the provided random function', () => {
    const input = [1, 2, 3, 4, 5]
    const shuffled = fisherYatesShuffle(input, deterministicRandom([0, 0.5, 0.5, 0.5, 0.5]))
    expect(shuffled).toHaveLength(5)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })
})

function dealHand(state: ReturnType<typeof createInitialState>) {
  return twentyOneReducer(state, { type: 'deal', bet: state.pendingBet })
}

function doubleDown(state: ReturnType<typeof createInitialState>) {
  const hand = state.playerHands[state.activeHandIndex]!
  return twentyOneReducer(state, { type: 'double', additionalBet: hand.bet })
}

describe('game reducer', () => {
  it('allows betting phase transitions without dealing', () => {
    const state = createInitialState(createShoe(deterministicRandom([0.5])))
    const next = twentyOneReducer(state, { type: 'set_bet', bet: 15 })
    expect(next.pendingBet).toBe(15)
    expect(next.phase).toBe('betting')
  })

  it('preserves Hi-Lo running count across consecutive hands in the same shoe era', () => {
    let state = createInitialState(createShoe(deterministicRandom([0.5])))

    state = dealHand(state)
    if (state.phase === 'playing') {
      state = twentyOneReducer(state, { type: 'stand' })
    }
    expect(state.phase).toBe('resolved')

    const snapshotAfterHandOne = toSnapshot(state)
    const countAfterHandOne = snapshotAfterHandOne.shoe.runningCount
    const discardAfterHandOne = snapshotAfterHandOne.shoe.discardCount
    const remainingAfterHandOne = snapshotAfterHandOne.shoe.totalRemaining
    expect(snapshotAfterHandOne.shoe.handsCompleted).toBe(1)
    expect(discardAfterHandOne).toBeGreaterThan(0)

    state = dealHand(state)
    const snapshotAfterDealTwo = toSnapshot(state)
    expect(snapshotAfterDealTwo.shoe.handsCompleted).toBe(1)
    expect(snapshotAfterDealTwo.shoe.discardCount).toBeGreaterThan(discardAfterHandOne)
    expect(snapshotAfterDealTwo.shoe.totalRemaining).toBeLessThan(remainingAfterHandOne)
    expect(snapshotAfterDealTwo.shoe.runningCount).not.toBe(0)
    if (countAfterHandOne !== 0) {
      expect(snapshotAfterDealTwo.shoe.runningCount).not.toBe(countAfterHandOne)
    }
  })

  it('doubles the active hand bet and total staked amount', () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const random = deterministicRandom([seed / 100, 0.5, 0.25])
      let state = createInitialState(createShoe(random))
      state = twentyOneReducer(state, { type: 'set_bet', bet: MIN_BET })
      state = dealHand(state)
      if (state.phase !== 'playing') continue
      if (state.playerHands[0]!.cards.length !== 2) continue

      const initialBet = state.playerHands[0]!.bet
      state = doubleDown(state)

      expect(state.playerHands[0]!.bet).toBe(initialBet * 2)
      const snapshot = toSnapshot(state)
      expect(snapshot.totalStaked).toBe(initialBet * 2)
      return
    }

    throw new Error('could not find a deal seed suitable for double test')
  })

  it('pays out based on the doubled bet after a winning double down', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const random = deterministicRandom([seed / 100, 0.5, 0.25, 0.75])
      let state = createInitialState(createShoe(random))
      state = twentyOneReducer(state, { type: 'set_bet', bet: MIN_BET })
      state = dealHand(state)
      if (state.phase !== 'playing' || state.playerHands[0]!.cards.length !== 2) continue

      const initialBet = state.playerHands[0]!.bet
      state = doubleDown(state)
      if (state.playerHands[0]!.bet !== initialBet * 2) continue
      if (state.phase !== 'dealer' && state.phase !== 'resolved') continue

      const doubledBet = state.playerHands[0]!.bet
      if (state.playerHands[0]!.outcome === 'win' || state.playerHands[0]!.outcome === 'blackjack') {
        expect(state.playerHands[0]!.payout).toBe(doubledBet * 2)
        expect(state.lastHandNet).toBe(doubledBet)
        return
      }
    }

    throw new Error('could not find a winning double-down seed')
  })

  it('only resets Hi-Lo running count after the fifth completed hand reshuffles the shoe', () => {
    let state = createInitialState(createShoe(deterministicRandom([0.5])))
    let runningCountBeforeReshuffle: number | null = null

    for (let hand = 1; hand <= HANDS_PER_SHOE; hand += 1) {
      state = dealHand(state)
      if (state.phase === 'playing') {
        state = twentyOneReducer(state, { type: 'stand' })
      }
      expect(state.phase).toBe('resolved')

      if (hand < HANDS_PER_SHOE) {
        expect(state.shoe.handsCompleted).toBe(hand)
        expect(state.shoe.runningCount).not.toBe(0)
        runningCountBeforeReshuffle = state.shoe.runningCount
      }
    }

    expect(state.shoe.handsCompleted).toBe(0)
    expect(state.shoe.discardPile.length).toBeLessThanOrEqual(4)
    expect(state.shoe.runningCount).toBe(0)
    expect(runningCountBeforeReshuffle).not.toBe(0)
  })
})
