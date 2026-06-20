import { BLACKJACK_PAYOUT_DENOMINATOR, BLACKJACK_PAYOUT_NUMERATOR, DEALER_HITS_SOFT_17 } from './constants'
import { getHandValue } from './handValue'
import type { Card, PlayerHand, Rank } from './types'

export type { HandValue } from './handValue'
export { getHandValue, isBlackjack, isBusted, isPair, rankValue } from './handValue'

export function dealerUpCardRank(dealerHand: readonly Card[]): Rank | null {
  const up = dealerHand.find((c) => c.faceUp)
  return up?.rank ?? null
}

export function dealerShouldHit(cards: readonly Card[]): boolean {
  const { total, isSoft } = getHandValue(cards)
  if (total < 17) return true
  if (total === 17 && isSoft && DEALER_HITS_SOFT_17) return true
  return false
}

export function blackjackPayout(bet: number): number {
  return bet + (bet * BLACKJACK_PAYOUT_NUMERATOR) / BLACKJACK_PAYOUT_DENOMINATOR
}

export function winPayout(bet: number): number {
  return bet * 2
}

export function pushPayout(bet: number): number {
  return bet
}

export function allPlayerHandsDone(hands: readonly PlayerHand[]): boolean {
  return hands.every(
    (hand) =>
      hand.status === 'stood' ||
      hand.status === 'busted' ||
      hand.status === 'blackjack' ||
      hand.status === 'doubled',
  )
}

export function visibleCards(cards: readonly Card[]): Card[] {
  return cards.filter((c) => c.faceUp)
}
