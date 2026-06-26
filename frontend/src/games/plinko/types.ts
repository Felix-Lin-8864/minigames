export type RiskTier = 'low' | 'medium' | 'high'

export interface DropResult {
  path: number[]
  slot: number
  multiplier: number
  payout: number
}

export interface PlinkoConfig {
  rows: number
  multipliers: Record<RiskTier, number[]>
  minBet: number
}

export interface ActiveDrop {
  id: number
  bet: number
  risk: RiskTier
  path: number[]
  slot: number
  payout: number
  multiplier: number
}

export interface PlinkoState {
  pendingBet: number
  risk: RiskTier
  activeDrops: ActiveDrop[]
  sessionNet: number
  nextDropId: number
}

export type PlinkoAction =
  | { type: 'set_bet'; bet: number }
  | { type: 'set_risk'; risk: RiskTier }
  | {
      type: 'drop'
      id: number
      bet: number
      risk: RiskTier
      path: number[]
      slot: number
      payout: number
      multiplier: number
    }
  | { type: 'complete_drop'; id: number }

export interface PlinkoSnapshot {
  pendingBet: number
  risk: RiskTier
  activeDrops: ActiveDrop[]
  sessionNet: number
}
