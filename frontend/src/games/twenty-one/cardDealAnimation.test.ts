import { describe, expect, it } from 'vitest'
import { createCard } from './cards'
import {
  findNewCards,
  isInitialDeal,
  sortCardsForDealAnimation,
  visibleDealerHandForTotal,
} from './cardDealAnimation'
import { getHandValue } from './handValue'
import type { TwentyOneSnapshot } from './types'

function baseSnapshot(overrides: Partial<TwentyOneSnapshot> = {}): TwentyOneSnapshot {
  return {
    phase: 'playing',
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    dealerHoleRevealed: false,
    bet: 10,
    pairBet: 0,
    pairBetResult: null,
    pairBetPayout: 0,
    pairBetOriginalCards: null,
    totalStaked: 10,
    message: null,
    lastHandNet: 0,
    shoe: {
      queueLength: 300,
      discardCount: 0,
      handsCompleted: 0,
      totalRemaining: 300,
      remainingByValue: {} as TwentyOneSnapshot['shoe']['remainingByValue'],
      probabilities: {},
      pairBetProbabilities: {
        perfect: 0,
        colored: 0,
        mixed: 0,
        none: 1,
      },
      runningCount: 0,
      trueCount: 0,
    },
    splitCount: 0,
    resolutionId: 1,
    ...overrides,
  }
}

describe('cardDealAnimation', () => {
  it('orders the initial four-card deal player-dealer-player-dealer', () => {
    const p0 = createCard('hearts', 'A')
    const p1 = createCard('spades', 'K')
    const d0 = createCard('clubs', '7')
    const d1 = createCard('diamonds', '9', false)

    const snapshot = baseSnapshot({
      playerHands: [
        {
          cards: [p0, p1],
          bet: 10,
          status: 'active',
          isSplitAces: false,
          isFromSplit: false,
          outcome: 'pending',
          payout: 0,
        },
      ],
      dealerHand: [d0, d1],
    })

    const newCards = [p0, p1, d0, d1]
    expect(isInitialDeal(newCards, snapshot)).toBe(true)
    expect(sortCardsForDealAnimation(newCards, snapshot)).toEqual([p0, d0, p1, d1])
  })

  it('detects newly dealt cards by reference', () => {
    const kept = createCard('hearts', 'A')
    const dealt = createCard('clubs', '4')
    const prev = baseSnapshot({
      playerHands: [
        {
          cards: [kept],
          bet: 10,
          status: 'active',
          isSplitAces: false,
          isFromSplit: false,
          outcome: 'pending',
          payout: 0,
        },
      ],
    })
    const next = baseSnapshot({
      playerHands: [
        {
          cards: [kept, dealt],
          bet: 10,
          status: 'active',
          isSplitAces: false,
          isFromSplit: false,
          outcome: 'pending',
          payout: 0,
        },
      ],
    })

    expect(findNewCards(prev, next)).toEqual([dealt])
  })

  it('counts only revealed face-up dealer cards toward the total', () => {
    const upcard = createCard('hearts', '10')
    const hole = createCard('clubs', '6', false)
    const draw = createCard('spades', '5')
    const visible = new Set([upcard, hole])
    const isCardVisible = (card: typeof upcard) => visible.has(card)
    const displayFaceDownHole = (card: typeof upcard, isDealerHole: boolean) =>
      isDealerHole ? { ...card, faceUp: false } : card

    expect(
      getHandValue(
        visibleDealerHandForTotal([upcard, hole, draw], isCardVisible, displayFaceDownHole),
      ).total,
    ).toBe(10)

    const displayFaceUpHole = (card: typeof upcard, isDealerHole: boolean) =>
      isDealerHole ? { ...card, faceUp: true } : card

    expect(
      getHandValue(
        visibleDealerHandForTotal([upcard, hole, draw], isCardVisible, displayFaceUpHole),
      ).total,
    ).toBe(16)

    visible.add(draw)
    expect(
      getHandValue(
        visibleDealerHandForTotal([upcard, hole, draw], isCardVisible, displayFaceUpHole),
      ).total,
    ).toBe(21)
  })
})
