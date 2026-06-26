import type { CardValueKey } from './constants'
import type { Card } from '../cards/types'
import type { PairResult, PairTierProbabilities, RemainingBySuitRank } from './pairBet'

export type { Card, Rank, Suit } from '../cards/types'

export type OptimalMove = 'hit' | 'stand' | 'double' | 'split'

export type HandOutcome = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'pending'

export type PlayerHandStatus =
  | 'active'
  | 'stood'
  | 'busted'
  | 'blackjack'
  | 'doubled'
  | 'surrendered'

export interface PlayerHand {
  cards: Card[]
  bet: number
  status: PlayerHandStatus
  /** True when this hand originated from splitting a pair of aces. */
  isSplitAces: boolean
  isFromSplit: boolean
  outcome: HandOutcome
  payout: number
}

export type GamePhase = 'betting' | 'pair_reveal' | 'playing' | 'dealer' | 'resolved'

export interface CardProbabilities {
  [key: string]: number
}

export interface ShoeSnapshot {
  queueLength: number
  discardCount: number
  handsCompleted: number
  totalRemaining: number
  remainingByValue: Record<CardValueKey, number>
  probabilities: CardProbabilities
  pairBetProbabilities: PairTierProbabilities
  runningCount: number
  trueCount: number
}

export interface TwentyOneSnapshot {
  phase: GamePhase
  playerHands: PlayerHand[]
  activeHandIndex: number
  dealerHand: Card[]
  dealerHoleRevealed: boolean
  bet: number
  pairBet: number
  pairBetResult: PairResult | null
  pairBetPayout: number
  pairBetOriginalCards: Card[] | null
  totalStaked: number
  message: string | null
  lastHandNet: number
  shoe: ShoeSnapshot
  splitCount: number
  resolutionId: number
}

export interface ShoeState {
  queue: Card[]
  discardPile: Card[]
  handsCompleted: number
  remainingBySuitRank: RemainingBySuitRank
  remainingByValue: Record<CardValueKey, number>
  runningCount: number
}

export interface TwentyOneState {
  phase: GamePhase
  playerHands: PlayerHand[]
  activeHandIndex: number
  dealerHand: Card[]
  dealerHoleRevealed: boolean
  pendingBet: number
  pendingPairBet: number
  pairBetWager: number
  pairBetResult: PairResult | null
  pairBetPayout: number
  pairBetOriginalCards: Card[] | null
  message: string | null
  lastHandNet: number
  shoe: ShoeState
  splitCount: number
  resolutionId: number
}

export type TwentyOneAction =
  | { type: 'set_bet'; bet: number }
  | { type: 'set_pair_bet'; pairBet: number }
  | { type: 'deal'; bet: number; pairBet: number }
  | { type: 'continue_after_pair' }
  | { type: 'hit' }
  | { type: 'stand' }
  | { type: 'double'; additionalBet: number }
  | { type: 'split'; additionalBet: number }
  | { type: 'next_hand' }
  | { type: 'dealer_step' }
  | { type: 'resolve' }
