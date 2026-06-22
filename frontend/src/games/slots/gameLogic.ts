import { MIN_BET, PARTIAL_PAYOUTS, PAYOUTS, SLOT_SYMBOLS, SYMBOL_WEIGHTS } from './constants'
import { SYMBOL_LABELS } from './symbols'
import type {
  MatchKind,
  SlotSymbol,
  SlotsAction,
  SlotsConfig,
  SlotsSnapshot,
  SlotsState,
  SpinResult,
} from './types'

export const DEFAULT_CONFIG: SlotsConfig = {
  symbols: SLOT_SYMBOLS,
  weights: SYMBOL_WEIGHTS,
  payouts: PAYOUTS,
  partialPayouts: PARTIAL_PAYOUTS,
  minBet: MIN_BET,
}

const NO_MATCH: Omit<SpinResult, 'reels'> = {
  payout: 0,
  multiplier: 0,
  matchKind: 'none',
  winningSymbol: null,
}

export function spinReel(
  symbols: SlotSymbol[],
  weights: number[],
  random: () => number = Math.random,
): SlotSymbol {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = random() * total
  for (let i = 0; i < symbols.length; i++) {
    r -= weights[i]!
    if (r <= 0) return symbols[i]!
  }
  return symbols[symbols.length - 1]!
}

export function spinReels(
  config: SlotsConfig,
  random: () => number = Math.random,
): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [
    spinReel(config.symbols, config.weights, random),
    spinReel(config.symbols, config.weights, random),
    spinReel(config.symbols, config.weights, random),
  ]
}

function pairedSymbol(reels: [SlotSymbol, SlotSymbol, SlotSymbol]): SlotSymbol | null {
  const [a, b, c] = reels
  if (a === b && a !== c) return a
  if (b === c && a !== b) return b
  if (a === c && a !== b) return a
  return null
}

export function evaluateSpin(
  reels: [SlotSymbol, SlotSymbol, SlotSymbol],
  bet: number,
  payouts: Record<SlotSymbol, number>,
  partialPayouts: Partial<Record<SlotSymbol, number>> = PARTIAL_PAYOUTS,
): SpinResult {
  const [a, b, c] = reels
  if (a === b && b === c) {
    const multiplier = payouts[a]!
    return {
      reels,
      payout: bet * multiplier,
      multiplier,
      matchKind: 'three',
      winningSymbol: a,
    }
  }

  const pair = pairedSymbol(reels)
  if (pair != null) {
    const multiplier = partialPayouts[pair]
    if (multiplier != null) {
      return {
        reels,
        payout: bet * multiplier,
        multiplier,
        matchKind: 'two',
        winningSymbol: pair,
      }
    }
  }

  return { reels, ...NO_MATCH }
}

export function twoOfAKindProbability(pReel: number): number {
  return 3 * pReel ** 2 * (1 - pReel)
}

export function theoreticalRtp(config: SlotsConfig): number {
  const totalWeight = config.weights.reduce((a, b) => a + b, 0)
  return config.symbols.reduce((rtp, symbol, i) => {
    const p = config.weights[i]! / totalWeight
    const threeKind = p ** 3 * config.payouts[symbol]!
    const partial = config.partialPayouts[symbol]
    const twoKind = partial != null ? twoOfAKindProbability(p) * partial : 0
    return rtp + threeKind + twoKind
  }, 0)
}

function formatSpinMessage(
  payout: number,
  multiplier: number,
  symbol: SlotSymbol | null,
  matchKind: MatchKind,
): string {
  if (payout > 0 && symbol != null && matchKind !== 'none') {
    const label = SYMBOL_LABELS[symbol]
    if (matchKind === 'three') {
      return `3× ${label} — ${payout} tadpoles!`
    }
    const refundNote = multiplier === 1 ? ' (refund)' : ''
    return `2× ${label} — ${multiplier}×${refundNote} — ${payout} tadpoles!`
  }
  return 'No match.'
}

export function createInitialState(): SlotsState {
  return {
    phase: 'idle',
    pendingBet: MIN_BET,
    bet: 0,
    reels: null,
    payout: 0,
    multiplier: 0,
    message: null,
    resolutionId: 0,
  }
}

export function slotsReducer(state: SlotsState, action: SlotsAction): SlotsState {
  switch (action.type) {
    case 'set_bet': {
      if (state.phase !== 'idle' && state.phase !== 'revealed') return state
      const bet = Math.floor(action.bet)
      if (!Number.isFinite(bet) || bet < MIN_BET) return state
      return { ...state, pendingBet: bet }
    }

    case 'spin': {
      if (state.phase !== 'idle' && state.phase !== 'revealed') return state
      const bet = Math.floor(action.bet)
      if (!Number.isFinite(bet) || bet < MIN_BET) return state
      return {
        ...state,
        phase: 'spinning',
        bet,
        reels: action.reels,
        payout: action.payout,
        multiplier: action.multiplier,
        message: formatSpinMessage(
          action.payout,
          action.multiplier,
          action.winningSymbol,
          action.matchKind,
        ),
      }
    }

    case 'complete_spin': {
      if (state.phase !== 'spinning') return state
      return {
        ...state,
        phase: 'revealed',
        resolutionId: state.resolutionId + 1,
      }
    }

    default:
      return state
  }
}

export function toSnapshot(state: SlotsState): SlotsSnapshot {
  return {
    phase: state.phase,
    pendingBet: state.pendingBet,
    bet: state.bet,
    reels: state.reels,
    payout: state.payout,
    multiplier: state.multiplier,
    message: state.message,
    resolutionId: state.resolutionId,
  }
}
