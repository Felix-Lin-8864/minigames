import type { Card } from '../cards/types'
import type { ShoeState } from '../cards/shoe'

export type BaccaratBetType = 'player' | 'banker' | 'tie'

export type BaccaratOutcome = 'player' | 'banker' | 'tie'

export type GamePhase = 'betting' | 'dealing' | 'resolved'

export interface BaccaratBet {
  type: BaccaratBetType
  amount: number
}

export interface BaccaratHandState {
  playerCards: Card[]
  bankerCards: Card[]
  playerTotal: number
  bankerTotal: number
  outcome: BaccaratOutcome | null
}

export interface SessionTally {
  player: number
  banker: number
  tie: number
}

export interface BaccaratSnapshot {
  phase: GamePhase
  pendingBetType: BaccaratBetType
  pendingBet: number
  betType: BaccaratBetType | null
  bet: number
  hand: BaccaratHandState | null
  outcome: BaccaratOutcome | null
  payout: number
  lastHandNet: number
  message: string | null
  sessionTally: SessionTally
  shoeHandsCompleted: number
  resolutionId: number
  canDeal: boolean
}

export interface BaccaratState {
  phase: GamePhase
  pendingBetType: BaccaratBetType
  pendingBet: number
  betType: BaccaratBetType | null
  bet: number
  hand: BaccaratHandState | null
  outcome: BaccaratOutcome | null
  payout: number
  lastHandNet: number
  message: string | null
  sessionTally: SessionTally
  shoe: ShoeState
  resolutionId: number
}

export type BaccaratAction =
  | { type: 'set_bet_type'; betType: BaccaratBetType }
  | { type: 'set_bet_amount'; amount: number }
  | { type: 'deal'; betType: BaccaratBetType; amount: number }
  | { type: 'finish_dealing' }
  | { type: 'next_hand' }
