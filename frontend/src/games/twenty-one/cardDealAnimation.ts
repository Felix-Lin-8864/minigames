export { CARD_DEAL_DELAY_MS, CARD_DEAL_DURATION_MS } from '../cards/dealAnimation'

import type { Card, TwentyOneSnapshot } from './types'

export function collectSnapshotCards(snapshot: TwentyOneSnapshot): Card[] {
  return [
    ...snapshot.dealerHand,
    ...snapshot.playerHands.flatMap((hand) => hand.cards),
  ]
}

export function findNewCards(prev: TwentyOneSnapshot, next: TwentyOneSnapshot): Card[] {
  const prevCards = new Set(collectSnapshotCards(prev))
  return collectSnapshotCards(next).filter((card) => !prevCards.has(card))
}

export function isInitialDeal(newCards: Card[], snapshot: TwentyOneSnapshot): boolean {
  return (
    newCards.length >= 4 &&
    snapshot.playerHands.length === 1 &&
    snapshot.playerHands[0]!.cards.length === 2 &&
    snapshot.dealerHand.length === 2
  )
}

export function sortCardsForDealAnimation(
  newCards: Card[],
  snapshot: TwentyOneSnapshot,
): Card[] {
  if (newCards.length === 0) return []

  if (isInitialDeal(newCards, snapshot)) {
    const player = snapshot.playerHands[0]!.cards
    const dealer = snapshot.dealerHand
    return [player[0]!, dealer[0]!, player[1]!, dealer[1]!].filter((card) =>
      newCards.includes(card),
    )
  }

  const ordered: Card[] = []
  for (const hand of snapshot.playerHands) {
    for (const card of hand.cards) {
      if (newCards.includes(card)) ordered.push(card)
    }
  }
  for (const card of snapshot.dealerHand) {
    if (newCards.includes(card)) ordered.push(card)
  }
  return ordered
}

export function shouldFlipDealerHole(
  prev: TwentyOneSnapshot,
  next: TwentyOneSnapshot,
): boolean {
  return !prev.dealerHoleRevealed && next.dealerHoleRevealed
}

export function isSnapshotCleared(snapshot: TwentyOneSnapshot): boolean {
  return snapshot.playerHands.length === 0 && snapshot.dealerHand.length === 0
}

export function dealAnimationSignature(snapshot: TwentyOneSnapshot): string {
  const player = snapshot.playerHands
    .map((hand) =>
      hand.cards.map((card) => `${card.suit}:${card.rank}:${card.faceUp ? 1 : 0}`).join('/'),
    )
    .join('|')
  const dealer = snapshot.dealerHand
    .map((card) => `${card.suit}:${card.rank}:${card.faceUp ? 1 : 0}`)
    .join('/')

  return [
    snapshot.resolutionId,
    snapshot.phase,
    snapshot.dealerHoleRevealed ? 1 : 0,
    dealer,
    player,
  ].join(';')
}

export function visibleDealerHandForTotal(
  dealerHand: readonly Card[],
  isCardVisible: (card: Card) => boolean,
  displayCard: (card: Card, isDealerHole: boolean) => Card,
): Card[] {
  return dealerHand.flatMap((card, index) => {
    if (!isCardVisible(card)) return []
    const displayed = displayCard(card, index === 1)
    if (!displayed.faceUp) return []
    return [displayed]
  })
}
