import { isValidAdjacency, resolveSpin, type Bet } from './bets'
import { MIN_BET, RECENT_SPINS_LIMIT } from './constants'
import type { RouletteAction, RouletteSnapshot, RouletteState } from './types'

export function createInitialState(): RouletteState {
  return {
    phase: 'betting',
    pendingBets: [],
    selectedChip: MIN_BET,
    spinResult: null,
    betOutcomes: null,
    lastSpinNet: 0,
    lastRoundBets: [],
    recentSpins: [],
    message: null,
    resolutionId: 0,
  }
}

export function totalStaked(state: RouletteState): number {
  return state.pendingBets.reduce((sum, b) => sum + b.amount, 0)
}

function cloneBets(bets: Bet[]): Bet[] {
  return bets.map((b) => ({ ...b, numbers: [...b.numbers] }))
}

export function toSnapshot(state: RouletteState): RouletteSnapshot {
  return {
    phase: state.phase,
    pendingBets: [...state.pendingBets],
    selectedChip: state.selectedChip,
    spinResult: state.spinResult,
    betOutcomes: state.betOutcomes ? [...state.betOutcomes] : null,
    lastSpinNet: state.lastSpinNet,
    recentSpins: [...state.recentSpins],
    message: state.message,
    resolutionId: state.resolutionId,
    totalStaked: totalStaked(state),
    canRebet: state.lastRoundBets.length > 0,
  }
}

function formatSpinMessage(net: number): string {
  if (net > 0) return `You won ${net} tadpoles!`
  if (net < 0) return `You lost ${Math.abs(net)} tadpoles.`
  return 'Break even.'
}

export function rouletteReducer(
  state: RouletteState,
  action: RouletteAction,
): RouletteState {
  switch (action.type) {
    case 'set_chip': {
      if (state.phase !== 'betting') return state
      const amount = Math.floor(action.amount)
      if (!Number.isFinite(amount) || amount < MIN_BET) return state
      return { ...state, selectedChip: amount }
    }

    case 'place_bet': {
      if (state.phase !== 'betting') return state
      const { bet } = action
      if (!Number.isFinite(bet.amount) || bet.amount < MIN_BET) return state
      if (!isValidAdjacency(bet.type, bet.numbers)) return state
      return {
        ...state,
        pendingBets: [...state.pendingBets, bet],
      }
    }

    case 'remove_bet': {
      if (state.phase !== 'betting') return state
      if (action.index < 0 || action.index >= state.pendingBets.length) return state
      return {
        ...state,
        pendingBets: state.pendingBets.filter((_, i) => i !== action.index),
      }
    }

    case 'clear_bets': {
      if (state.phase !== 'betting') return state
      return { ...state, pendingBets: [] }
    }

    case 'rebet': {
      if (state.phase !== 'betting') return state
      if (state.lastRoundBets.length === 0) return state
      return { ...state, pendingBets: cloneBets(state.lastRoundBets) }
    }

    case 'spin': {
      if (state.phase !== 'betting') return state
      if (state.pendingBets.length === 0) return state

      const resolution = resolveSpin(state.pendingBets, action.spinResult)
      return {
        ...state,
        phase: 'revealing',
        lastRoundBets: cloneBets(state.pendingBets),
        spinResult: action.spinResult,
        betOutcomes: resolution.outcomes,
        lastSpinNet: resolution.net,
        message: formatSpinMessage(resolution.net),
      }
    }

    case 'complete_round': {
      if (state.phase !== 'revealing' || state.spinResult === null) return state
      const recentSpins = [state.spinResult, ...state.recentSpins].slice(
        0,
        RECENT_SPINS_LIMIT,
      )
      return {
        ...state,
        phase: 'betting',
        pendingBets: [],
        spinResult: null,
        betOutcomes: null,
        message: null,
        recentSpins,
        resolutionId: state.resolutionId + 1,
      }
    }

    default:
      return state
  }
}
