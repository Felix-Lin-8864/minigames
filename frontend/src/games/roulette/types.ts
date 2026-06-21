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
  boostAmount: number
  boostedPocket: number | null
  boostCost: number
  totalWager: number
  multiplierHit: boolean
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
  lastRoundBoostAmount: number
  recentSpins: number[]
  message: string | null
  resolutionId: number
  boostAmount: number
  boostedPocket: number | null
  multiplierHit: boolean
}

export type RouletteAction =
  | { type: 'set_chip'; amount: number }
  | { type: 'set_boost_amount'; amount: number }
  | { type: 'place_bet'; bet: Bet }
  | { type: 'remove_bet'; index: number }
  | { type: 'remove_bet_zone'; zoneKey: string }
  | { type: 'clear_bets' }
  | { type: 'rebet' }
  | { type: 'spin'; spinResult: number; boostedPocket?: number }
  | { type: 'complete_round' }
