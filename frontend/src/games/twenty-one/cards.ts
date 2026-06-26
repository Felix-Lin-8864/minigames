import { createCard, createFaceDownCard, buildShoePool } from '../cards/pool'
import { isRedSuit, suitSymbol, cardLabel, cardDisplayRank } from '../cards/display'
import { DECK_COUNT, RANKS, SUITS } from '../cards/constants'
import { PER_DECK_VALUE_COUNTS, type CardValueKey } from './constants'
import type { RemainingBySuitRank } from './pairBet'
import type { Rank } from './types'

export {
  createCard,
  createFaceDownCard,
  buildShoePool,
  isRedSuit,
  suitSymbol,
  cardLabel,
  cardDisplayRank,
}

export function rankToValueKey(rank: Rank): CardValueKey {
  if (rank === 'A') return 'A'
  if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return '10'
  return rank
}

export function createInitialRemainingBySuitRank(): RemainingBySuitRank {
  const counts = {} as RemainingBySuitRank
  for (const suit of SUITS) {
    counts[suit] = {} as Record<Rank, number>
    for (const rank of RANKS) {
      counts[suit][rank] = DECK_COUNT
    }
  }
  return counts
}

export function deriveValueCountsFromSuitRank(
  remainingBySuitRank: RemainingBySuitRank,
): Record<CardValueKey, number> {
  const counts = {} as Record<CardValueKey, number>
  for (const key of Object.keys(PER_DECK_VALUE_COUNTS) as CardValueKey[]) {
    counts[key] = 0
  }
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      counts[rankToValueKey(rank)] += remainingBySuitRank[suit][rank]
    }
  }
  return counts
}

export function cloneRemainingBySuitRank(remaining: RemainingBySuitRank): RemainingBySuitRank {
  const clone = {} as RemainingBySuitRank
  for (const suit of SUITS) {
    clone[suit] = { ...remaining[suit] }
  }
  return clone
}

export function createInitialRemainingCounts(): Record<CardValueKey, number> {
  return deriveValueCountsFromSuitRank(createInitialRemainingBySuitRank())
}

export function hiLoValue(rank: Rank): number {
  if (rank === '2' || rank === '3' || rank === '4' || rank === '5' || rank === '6') return 1
  if (rank === '7' || rank === '8' || rank === '9') return 0
  return -1
}
