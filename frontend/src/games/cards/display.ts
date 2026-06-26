import type { Card, Suit } from './types'

export function cardLabel(card: Card): string {
  return card.faceUp ? card.rank : '?'
}

export function cardDisplayRank(card: Card): string {
  if (!card.faceUp) return ''
  return card.rank
}

export function suitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return '♥'
    case 'diamonds':
      return '♦'
    case 'clubs':
      return '♣'
    case 'spades':
      return '♠'
  }
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds'
}
