export type SlotSymbol =
  | 'fly'
  | 'reed'
  | 'droplet'
  | 'lilypad'
  | 'caterpillar'
  | 'egg'
  | 'goldenfrog'

export type MatchKind = 'three' | 'two' | 'none'

export interface SpinResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]
  payout: number
  multiplier: number
  matchKind: MatchKind
  winningSymbol: SlotSymbol | null
}

export interface SlotsConfig {
  symbols: SlotSymbol[]
  weights: number[]
  payouts: Record<SlotSymbol, number>
  partialPayouts: Partial<Record<SlotSymbol, number>>
  minBet: number
}

export type SlotsPhase = 'idle' | 'spinning' | 'revealed'

export interface SlotsState {
  phase: SlotsPhase
  pendingBet: number
  bet: number
  reels: [SlotSymbol, SlotSymbol, SlotSymbol] | null
  payout: number
  multiplier: number
  message: string | null
  resolutionId: number
}

export type SlotsAction =
  | { type: 'set_bet'; bet: number }
  | {
      type: 'spin'
      bet: number
      reels: [SlotSymbol, SlotSymbol, SlotSymbol]
      payout: number
      multiplier: number
      matchKind: MatchKind
      winningSymbol: SlotSymbol | null
    }
  | { type: 'complete_spin' }

export interface SlotsSnapshot {
  phase: SlotsPhase
  pendingBet: number
  bet: number
  reels: [SlotSymbol, SlotSymbol, SlotSymbol] | null
  payout: number
  multiplier: number
  message: string | null
  resolutionId: number
}
