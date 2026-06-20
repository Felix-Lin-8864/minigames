import type { Card, Rank } from './types'

export interface HandValue {
  total: number
  isSoft: boolean
}

export function rankValue(rank: Rank): number {
  if (rank === 'A') return 11
  if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}

export function getHandValue(cards: readonly Card[]): HandValue {
  let total = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1
      total += 11
    } else {
      total += rankValue(card.rank)
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }

  const isSoft = aces > 0 && total <= 21
  return { total, isSoft }
}

export function isBlackjack(cards: readonly Card[]): boolean {
  return cards.length === 2 && getHandValue(cards).total === 21
}

export function isBusted(cards: readonly Card[]): boolean {
  return getHandValue(cards).total > 21
}

export function isPair(cards: readonly Card[]): boolean {
  if (cards.length !== 2) return false
  return rankValue(cards[0]!.rank) === rankValue(cards[1]!.rank)
}
