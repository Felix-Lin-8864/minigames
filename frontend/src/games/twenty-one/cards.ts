import { PER_DECK_VALUE_COUNTS, DECK_COUNT, RANKS, SUITS, type CardValueKey } from './constants'
import type { Card, Rank, Suit } from './types'

export function rankToValueKey(rank: Rank): CardValueKey {
  if (rank === 'A') return 'A'
  if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') return '10'
  return rank
}

export function createCard(suit: Suit, rank: Rank, faceUp = true): Card {
  return { suit, rank, faceUp }
}

export function createFaceDownCard(suit: Suit, rank: Rank): Card {
  return { suit, rank, faceUp: false }
}

/** Build the full 312-card pool for a fresh shoe (unshuffled). */
export function buildShoePool(): Card[] {
  const pool: Card[] = []
  for (let deck = 0; deck < DECK_COUNT; deck += 1) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        pool.push(createCard(suit, rank))
      }
    }
  }
  return pool
}

export function createInitialRemainingCounts(): Record<CardValueKey, number> {
  const counts = {} as Record<CardValueKey, number>
  for (const [key, perDeck] of Object.entries(PER_DECK_VALUE_COUNTS) as [CardValueKey, number][]) {
    counts[key] = perDeck * DECK_COUNT
  }
  return counts
}

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

export function hiLoValue(rank: Rank): number {
  if (rank === '2' || rank === '3' || rank === '4' || rank === '5' || rank === '6') return 1
  if (rank === '7' || rank === '8' || rank === '9') return 0
  return -1
}
