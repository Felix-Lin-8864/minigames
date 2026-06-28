import { describe, expect, it } from 'vitest'
import { createCard, createInitialRemainingBySuitRank } from './cards'
import { DECK_COUNT } from './constants'
import {
  evaluatePairBet,
  getPairBetProbabilities,
  getPairPayout,
} from './pairBet'

describe('evaluatePairBet', () => {
  it('returns ace when both cards are Aces regardless of suit', () => {
    expect(evaluatePairBet(createCard('hearts', 'A'), createCard('spades', 'A'))).toBe('ace')
    expect(evaluatePairBet(createCard('diamonds', 'A'), createCard('clubs', 'A'))).toBe('ace')
    expect(evaluatePairBet(createCard('hearts', 'A'), createCard('hearts', 'A'))).toBe('ace')
  })

  it('returns perfect only when rank and suit both match (non-Ace)', () => {
    expect(evaluatePairBet(createCard('hearts', '8'), createCard('hearts', '8'))).toBe('perfect')
    expect(evaluatePairBet(createCard('spades', 'K'), createCard('spades', 'K'))).toBe('perfect')
    expect(evaluatePairBet(createCard('hearts', '8'), createCard('diamonds', '8'))).not.toBe('perfect')
  })

  it('returns royal for J/Q/K pairs that are not perfect', () => {
    expect(evaluatePairBet(createCard('hearts', 'K'), createCard('diamonds', 'K'))).toBe('royal')
    expect(evaluatePairBet(createCard('hearts', 'K'), createCard('clubs', 'K'))).toBe('royal')
    expect(evaluatePairBet(createCard('spades', 'Q'), createCard('clubs', 'Q'))).toBe('royal')
    expect(evaluatePairBet(createCard('diamonds', 'J'), createCard('hearts', 'J'))).toBe('royal')
  })

  it('returns colored when rank matches, suits differ, same color (non-Ace, non-royal)', () => {
    expect(evaluatePairBet(createCard('hearts', '8'), createCard('diamonds', '8'))).toBe('colored')
    expect(evaluatePairBet(createCard('clubs', '10'), createCard('spades', '10'))).toBe('colored')
  })

  it('returns mixed when rank matches but colors differ (non-Ace, non-royal)', () => {
    expect(evaluatePairBet(createCard('hearts', '8'), createCard('clubs', '8'))).toBe('mixed')
    expect(evaluatePairBet(createCard('diamonds', '5'), createCard('spades', '5'))).toBe('mixed')
  })

  it('returns none when ranks do not match', () => {
    expect(evaluatePairBet(createCard('hearts', '8'), createCard('clubs', '9'))).toBe('none')
    expect(evaluatePairBet(createCard('hearts', '10'), createCard('clubs', 'K'))).toBe('none')
  })
})

describe('getPairPayout', () => {
  const bet = 10

  it('returns exact multiples for each tier', () => {
    expect(getPairPayout('ace', bet)).toBe(bet * 30)
    expect(getPairPayout('perfect', bet)).toBe(bet * 20)
    expect(getPairPayout('royal', bet)).toBe(bet * 15)
    expect(getPairPayout('colored', bet)).toBe(bet * 10)
    expect(getPairPayout('mixed', bet)).toBe(bet * 5)
    expect(getPairPayout('none', bet)).toBe(0)
  })
})

describe('getPairBetProbabilities', () => {
  it('sums to 1 on a fresh 6-deck shoe', () => {
    const remaining = createInitialRemainingBySuitRank()
    const probs = getPairBetProbabilities(remaining)
    const sum = probs.ace + probs.perfect + probs.royal + probs.colored + probs.mixed + probs.none
    expect(sum).toBeCloseTo(1, 8)
  })

  it('matches known ace-pair probability on a fresh shoe', () => {
    const remaining = createInitialRemainingBySuitRank()
    const N = DECK_COUNT * 52
    const totalAces = DECK_COUNT * 4
    const expected = (totalAces * (totalAces - 1)) / (N * (N - 1))
    const probs = getPairBetProbabilities(remaining)
    expect(probs.ace).toBeCloseTo(expected, 10)
  })
})
