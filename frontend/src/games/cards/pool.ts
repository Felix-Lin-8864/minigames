import { DECK_COUNT, RANKS, SUITS } from './constants'
import type { Card, Rank, Suit } from './types'

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
