import type { Card } from '../cards/types'
import type { BaccaratHandState, BaccaratSnapshot } from './types'
import { handTotal } from './handLogic'

export function orderedDealCards(hand: BaccaratHandState): Card[] {
  const ordered: Card[] = []
  const player = hand.playerCards
  const banker = hand.bankerCards

  if (player[0]) ordered.push(player[0])
  if (banker[0]) ordered.push(banker[0])
  if (player[1]) ordered.push(player[1])
  if (banker[1]) ordered.push(banker[1])
  if (player[2]) ordered.push(player[2])
  if (banker[2]) ordered.push(banker[2])

  return ordered
}

export function visibleHandTotal(
  cards: Card[],
  isCardVisible: (card: Card) => boolean,
): number | null {
  const visible = cards.filter(isCardVisible)
  if (visible.length === 0) return null
  return handTotal(visible)
}

export function dealAnimationSignature(snapshot: BaccaratSnapshot): string {
  if (!snapshot.hand) {
    return `${snapshot.resolutionId};empty`
  }

  const player = snapshot.hand.playerCards
    .map((card) => `${card.suit}:${card.rank}`)
    .join('/')
  const banker = snapshot.hand.bankerCards
    .map((card) => `${card.suit}:${card.rank}`)
    .join('/')

  return [snapshot.resolutionId, player, banker].join(';')
}

export function isHandCleared(snapshot: BaccaratSnapshot): boolean {
  return snapshot.hand === null
}
