import type { Bet, BetOutcome } from './bets'

export type GamePhase = 'betting' | 'revealing'

export interface RouletteSnapshot {
  phase: GamePhase
  pendingBets: Bet[]
  selectedChip: number
  spinResult: number | null
  betOutcomes: BetOutcome[] | null
  lastSpinNet: number
  recentSpins: number[]
  message: string | null
  resolutionId: number
  totalStaked: number
  canRebet: boolean
}

export interface RouletteState {
  phase: GamePhase
  pendingBets: Bet[]
  selectedChip: number
  spinResult: number | null
  betOutcomes: BetOutcome[] | null
  lastSpinNet: number
  lastRoundBets: Bet[]
  recentSpins: number[]
  message: string | null
  resolutionId: number
}

export type RouletteAction =
  | { type: 'set_chip'; amount: number }
  | { type: 'place_bet'; bet: Bet }
  | { type: 'remove_bet'; index: number }
  | { type: 'clear_bets' }
  | { type: 'rebet' }
  | { type: 'spin'; spinResult: number }
  | { type: 'complete_round' }
