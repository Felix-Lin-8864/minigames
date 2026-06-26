export type FrogColour = 'green' | 'blue' | 'red' | 'yellow' | 'purple'

export type BetType = 'win' | 'exacta' | 'trifecta' | 'superfecta' | 'fullhouse'

export type GamePhase = 'betting' | 'racing' | 'resolved'

export type FrogPositions = Record<FrogColour, number>

export interface Bet {
  type: BetType
  selection: FrogColour[]
  amount: number
}

export interface RaceResult {
  finishOrder: FrogColour[]
}

export interface BetOutcome {
  won: boolean
  payout: number
  net: number
}

export interface FroggiesState {
  phase: GamePhase
  betType: BetType
  selection: (FrogColour | null)[]
  betAmount: number
  tickHistory: FrogPositions[] | null
  finishOrder: FrogColour[] | null
  betOutcome: BetOutcome | null
  animationTick: number
}

export type FroggiesAction =
  | { type: 'set_bet_type'; betType: BetType }
  | { type: 'set_slot'; index: number; frog: FrogColour | null }
  | { type: 'set_bet_amount'; amount: number }
  | {
      type: 'start_race'
      tickHistory: FrogPositions[]
      finishOrder: FrogColour[]
      betOutcome: BetOutcome
    }
  | { type: 'set_animation_tick'; tick: number }
  | { type: 'complete_race' }
  | { type: 'new_race' }

export interface FroggiesSnapshot {
  phase: GamePhase
  betType: BetType
  selection: (FrogColour | null)[]
  betAmount: number
  tickHistory: FrogPositions[] | null
  finishOrder: FrogColour[] | null
  betOutcome: BetOutcome | null
  animationTick: number
  canStartRace: boolean
}
