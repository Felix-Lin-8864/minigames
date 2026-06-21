import { createMultiplierBoost, isValidAdjacency, resolveSpin, betZoneKey, type Bet } from './bets'
import { getBoostTadpoleCost } from './boost'
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
    lastRoundBoostAmount: 0,
    recentSpins: [],
    message: null,
    resolutionId: 0,
    boostAmount: 0,
    boostedPocket: null,
    multiplierHit: false,
  }
}

export function totalStaked(state: RouletteState): number {
  return state.pendingBets.reduce((sum, b) => sum + b.amount, 0)
}

export function boostCost(state: RouletteState): number {
  return getBoostTadpoleCost(state.boostAmount)
}

export function totalWager(state: RouletteState): number {
  return totalStaked(state) + boostCost(state)
}

function cloneBets(bets: Bet[]): Bet[] {
  return bets.map((b) => ({ ...b, numbers: [...b.numbers] }))
}

export function toSnapshot(state: RouletteState): RouletteSnapshot {
  const staked = totalStaked(state)
  const bCost = boostCost(state)
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
    totalStaked: staked,
    boostAmount: state.boostAmount,
    boostedPocket: state.boostedPocket,
    boostCost: bCost,
    totalWager: staked + bCost,
    multiplierHit: state.multiplierHit,
    canRebet: state.lastRoundBets.length > 0,
  }
}

function formatSpinMessage(
  net: number,
  multiplierHit: boolean,
  boost: number,
  boostedPocket: number | null,
): string {
  if (net > 0) {
    if (multiplierHit && boostedPocket != null) {
      return `You won ${net} tadpoles (${boost}× on ${boostedPocket})!`
    }
    return `You won ${net} tadpoles!`
  }
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

    case 'set_boost_amount': {
      if (state.phase !== 'betting') return state
      const amount = Math.floor(action.amount)
      if (!Number.isFinite(amount) || amount < 0) return state
      return { ...state, boostAmount: amount }
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

    case 'remove_bet_zone': {
      if (state.phase !== 'betting') return state
      return {
        ...state,
        pendingBets: state.pendingBets.filter((b) => betZoneKey(b) !== action.zoneKey),
      }
    }

    case 'clear_bets': {
      if (state.phase !== 'betting') return state
      return { ...state, pendingBets: [] }
    }

    case 'rebet': {
      if (state.phase !== 'betting') return state
      if (state.lastRoundBets.length === 0) return state
      return {
        ...state,
        pendingBets: cloneBets(state.lastRoundBets),
        boostAmount: state.lastRoundBoostAmount,
      }
    }

    case 'spin': {
      if (state.phase !== 'betting') return state
      if (state.pendingBets.length === 0) return state

      const boost =
        action.boostedPocket != null
          ? createMultiplierBoost(action.boostedPocket, state.boostAmount)
          : null
      const boostedPocket = boost?.pocket ?? null

      const resolution = resolveSpin(state.pendingBets, action.spinResult, boost)
      return {
        ...state,
        phase: 'revealing',
        lastRoundBets: cloneBets(state.pendingBets),
        lastRoundBoostAmount: state.boostAmount,
        spinResult: action.spinResult,
        boostedPocket,
        betOutcomes: resolution.outcomes,
        lastSpinNet: resolution.net,
        multiplierHit: resolution.multiplierHit,
        message: formatSpinMessage(
          resolution.net,
          resolution.multiplierHit,
          state.boostAmount,
          boostedPocket,
        ),
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
        pendingBets: cloneBets(state.lastRoundBets),
        boostAmount: state.lastRoundBoostAmount,
        spinResult: null,
        betOutcomes: null,
        message: null,
        recentSpins,
        resolutionId: state.resolutionId + 1,
        boostedPocket: null,
        multiplierHit: false,
      }
    }

    default:
      return state
  }
}
