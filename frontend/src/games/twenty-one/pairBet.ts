import { RANKS, SUITS } from '../cards/constants'
import { isRedSuit } from './cards'
import type { Card, Rank, Suit } from './types'

export type PairResult = 'ace' | 'perfect' | 'royal' | 'colored' | 'mixed' | 'none'

export type PairTierProbabilities = {
  ace: number
  perfect: number
  royal: number
  colored: number
  mixed: number
  none: number
}

export type RemainingBySuitRank = Record<Suit, Record<Rank, number>>

const PAIR_PAYOUT_MULTIPLIER: Record<Exclude<PairResult, 'none'>, number> = {
  ace: 30,
  perfect: 20,
  royal: 15,
  colored: 10,
  mixed: 5,
}

export const PAIR_RESULT_LABELS: Record<PairResult, string> = {
  ace: 'Ace pair — 30:1',
  perfect: 'Perfect pair — 20:1',
  royal: 'Royal pair — 15:1',
  colored: 'Colored pair — 10:1',
  mixed: 'Mixed pair — 5:1',
  none: 'No pair',
}

export const PAIR_RESULT_OVERLAY_NAMES: Record<Exclude<PairResult, 'none'>, string> = {
  ace: 'Ace',
  perfect: 'Perfect',
  royal: 'Royal',
  colored: 'Colored',
  mixed: 'Mixed',
}

function isRoyalRank(rank: Rank): boolean {
  return rank === 'J' || rank === 'Q' || rank === 'K'
}

export function evaluatePairBet(card1: Card, card2: Card): PairResult {
  if (card1.rank !== card2.rank) return 'none'
  if (card1.rank === 'A') return 'ace'
  if (card1.suit === card2.suit) return 'perfect'
  if (isRoyalRank(card1.rank)) return 'royal'
  if (isRedSuit(card1.suit) === isRedSuit(card2.suit)) return 'colored'
  return 'mixed'
}

export function getPairPayout(result: PairResult, betAmount: number): number {
  if (result === 'none') return 0
  return betAmount * PAIR_PAYOUT_MULTIPLIER[result]
}

function totalRemaining(remaining: RemainingBySuitRank): number {
  let total = 0
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      total += remaining[suit][rank]
    }
  }
  return total
}

export function getPairBetProbabilities(
  remainingBySuitRank: RemainingBySuitRank,
): PairTierProbabilities {
  const N = totalRemaining(remainingBySuitRank)
  if (N < 2) {
    return { ace: 0, perfect: 0, royal: 0, colored: 0, mixed: 0, none: 1 }
  }

  const denom = N * (N - 1)
  let ace = 0
  let perfect = 0
  let royal = 0
  let colored = 0
  let mixed = 0

  const aceTotal = SUITS.reduce((sum, suit) => sum + remainingBySuitRank[suit].A, 0)
  ace = (aceTotal * (aceTotal - 1)) / denom

  for (const rank of RANKS) {
    if (rank === 'A') continue

    const h = remainingBySuitRank.hearts[rank]
    const d = remainingBySuitRank.diamonds[rank]
    const c = remainingBySuitRank.clubs[rank]
    const s = remainingBySuitRank.spades[rank]

    perfect += h * (h - 1) + d * (d - 1) + c * (c - 1) + s * (s - 1)

    const coloredForRank = 2 * h * d + 2 * c * s
    const mixedForRank = 2 * (h + d) * (c + s)
    if (isRoyalRank(rank)) {
      royal += coloredForRank + mixedForRank
    } else {
      colored += coloredForRank
      mixed += mixedForRank
    }
  }

  perfect /= denom
  royal /= denom
  colored /= denom
  mixed /= denom

  const none = Math.max(0, 1 - (ace + perfect + royal + colored + mixed))

  return { ace, perfect, royal, colored, mixed, none }
}
