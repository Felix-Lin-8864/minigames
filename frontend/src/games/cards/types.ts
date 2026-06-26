import type { RANKS, SUITS } from './constants'

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]

export interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export interface ShoeState {
  queue: Card[]
  discardPile: Card[]
  handsCompleted: number
}
