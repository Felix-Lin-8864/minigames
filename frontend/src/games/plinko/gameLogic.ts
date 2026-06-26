import { MIN_BET, MULTIPLIERS, ROWS, SLOT_PROBABILITIES } from './constants'
import type {
  DropResult,
  PlinkoAction,
  PlinkoConfig,
  PlinkoSnapshot,
  PlinkoState,
  RiskTier,
} from './types'

export const DEFAULT_CONFIG: PlinkoConfig = {
  rows: ROWS,
  multipliers: MULTIPLIERS,
  minBet: MIN_BET,
}

export function simulateDrop(
  rows: number = ROWS,
  random: () => number = Math.random,
): { path: number[]; slot: number } {
  let position = 0
  const path: number[] = []
  for (let i = 0; i < rows; i += 1) {
    if (random() < 0.5) position += 1
    path.push(position)
  }
  return { path, slot: position }
}

export function evaluateDrop(
  slot: number,
  bet: number,
  risk: RiskTier,
  config: PlinkoConfig = DEFAULT_CONFIG,
  path: number[] = [],
): DropResult {
  const multiplier = config.multipliers[risk][slot]!
  return {
    path,
    slot,
    multiplier,
    payout: bet * multiplier,
  }
}

export function theoreticalRtp(
  risk: RiskTier,
  config: PlinkoConfig = DEFAULT_CONFIG,
): number {
  const multipliers = config.multipliers[risk]
  return SLOT_PROBABILITIES.reduce(
    (rtp, probability, slot) => rtp + probability * multipliers[slot]!,
    0,
  )
}

export function createInitialState(): PlinkoState {
  return {
    pendingBet: MIN_BET,
    risk: 'low',
    activeDrops: [],
    sessionNet: 0,
    nextDropId: 1,
  }
}

export function plinkoReducer(state: PlinkoState, action: PlinkoAction): PlinkoState {
  switch (action.type) {
    case 'set_bet': {
      const bet = Math.floor(action.bet)
      if (!Number.isFinite(bet) || bet < MIN_BET) return state
      return { ...state, pendingBet: bet }
    }

    case 'set_risk': {
      return { ...state, risk: action.risk }
    }

    case 'drop': {
      const bet = Math.floor(action.bet)
      if (!Number.isFinite(bet) || bet < MIN_BET) return state
      const drop = {
        id: action.id,
        bet,
        risk: action.risk,
        path: action.path,
        slot: action.slot,
        payout: action.payout,
        multiplier: action.multiplier,
      }
      return {
        ...state,
        activeDrops: [...state.activeDrops, drop],
        nextDropId: Math.max(state.nextDropId, action.id + 1),
      }
    }

    case 'complete_drop': {
      const drop = state.activeDrops.find((d) => d.id === action.id)
      if (!drop) return state
      return {
        ...state,
        activeDrops: state.activeDrops.filter((d) => d.id !== action.id),
        sessionNet: state.sessionNet + drop.payout - drop.bet,
      }
    }

    default:
      return state
  }
}

export function toSnapshot(state: PlinkoState): PlinkoSnapshot {
  return {
    pendingBet: state.pendingBet,
    risk: state.risk,
    activeDrops: state.activeDrops,
    sessionNet: state.sessionNet,
  }
}
