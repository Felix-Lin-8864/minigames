import type { Card, Rank } from '../cards/types'
import type { BaccaratBet, BaccaratOutcome } from './types'

export function baccaratCardValue(rank: Rank): number {
  if (rank === 'A') return 1
  if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return 0
  return Number(rank)
}

export function handTotal(cards: Card[]): number {
  const sum = cards.reduce((total, card) => total + baccaratCardValue(card.rank), 0)
  return sum % 10
}

export function isNatural(total: number): boolean {
  return total === 8 || total === 9
}

export function shouldPlayerDraw(playerTotal: number): boolean {
  return playerTotal >= 0 && playerTotal <= 5
}

export function shouldBankerDraw(
  bankerTotal: number,
  playerDrewThird: boolean,
  playerThirdCardValue: number | null,
): boolean {
  if (!playerDrewThird) {
    return bankerTotal >= 0 && bankerTotal <= 5
  }

  if (playerThirdCardValue === null) {
    throw new Error('playerThirdCardValue required when player drew a third card')
  }

  if (bankerTotal <= 2) return true
  if (bankerTotal === 3) return playerThirdCardValue !== 8
  if (bankerTotal === 4) return playerThirdCardValue >= 2 && playerThirdCardValue <= 7
  if (bankerTotal === 5) return playerThirdCardValue >= 4 && playerThirdCardValue <= 7
  if (bankerTotal === 6) return playerThirdCardValue === 6 || playerThirdCardValue === 7
  return false
}

export function resolveHand(playerCards: Card[], bankerCards: Card[]): BaccaratOutcome {
  const playerTotal = handTotal(playerCards)
  const bankerTotal = handTotal(bankerCards)

  if (playerTotal > bankerTotal) return 'player'
  if (bankerTotal > playerTotal) return 'banker'
  return 'tie'
}

export function evaluateBet(bet: BaccaratBet, outcome: BaccaratOutcome): number {
  const { type, amount: stake } = bet

  if (type === 'player') {
    if (outcome === 'player') return stake * 2
    if (outcome === 'tie') return stake
    return 0
  }

  if (type === 'banker') {
    if (outcome === 'banker') return stake + stake * 0.95
    if (outcome === 'tie') return stake
    return 0
  }

  if (outcome === 'tie') return stake + stake * 8
  return 0
}
