import { MIN_BET, SLOT_COUNTS } from './constants'
import type {
  BetOutcome,
  FrogColour,
  FroggiesAction,
  FroggiesSnapshot,
  FroggiesState,
} from './types'

function emptySelection(): (FrogColour | null)[] {
  return [null, null, null, null, null]
}

export function createInitialState(): FroggiesState {
  return {
    phase: 'betting',
    betType: 'win',
    selection: emptySelection(),
    betAmount: MIN_BET,
    tickHistory: null,
    finishOrder: null,
    betOutcome: null,
    animationTick: 0,
  }
}

export function getRequiredSlotCount(state: FroggiesState): number {
  return SLOT_COUNTS[state.betType]
}

export function getActiveSelection(state: FroggiesState): FrogColour[] {
  const count = getRequiredSlotCount(state)
  return state.selection.slice(0, count).filter((frog): frog is FrogColour => frog !== null)
}

export function isSelectionComplete(state: FroggiesState): boolean {
  const count = getRequiredSlotCount(state)
  const active = state.selection.slice(0, count)
  if (active.some((frog) => frog === null)) return false
  return new Set(active).size === count
}

export function isValidBetAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= MIN_BET && amount % MIN_BET === 0
}

export function canStartRace(state: FroggiesState): boolean {
  return (
    state.phase === 'betting' &&
    isSelectionComplete(state) &&
    isValidBetAmount(state.betAmount)
  )
}

function clearSlotsBeyond(state: FroggiesState, count: number): (FrogColour | null)[] {
  const next = [...state.selection]
  for (let i = count; i < next.length; i += 1) {
    next[i] = null
  }
  return next
}

export function froggiesReducer(
  state: FroggiesState,
  action: FroggiesAction,
): FroggiesState {
  switch (action.type) {
    case 'set_bet_type': {
      if (state.phase !== 'betting') return state
      const slotCount = SLOT_COUNTS[action.betType]
      return {
        ...state,
        betType: action.betType,
        selection: clearSlotsBeyond(state, slotCount),
      }
    }

    case 'set_slot': {
      if (state.phase !== 'betting') return state
      if (action.index < 0 || action.index >= getRequiredSlotCount(state)) return state

      const nextSelection = [...state.selection]
      if (action.frog !== null) {
        const duplicateIndex = nextSelection.findIndex(
          (frog, index) => frog === action.frog && index !== action.index,
        )
        if (duplicateIndex !== -1) {
          nextSelection[duplicateIndex] = null
        }
      }
      nextSelection[action.index] = action.frog
      return { ...state, selection: nextSelection }
    }

    case 'set_bet_amount': {
      if (state.phase !== 'betting') return state
      const amount = Math.floor(action.amount)
      if (!isValidBetAmount(amount)) return state
      return { ...state, betAmount: amount }
    }

    case 'start_race': {
      if (!canStartRace(state)) return state
      return {
        ...state,
        phase: 'racing',
        tickHistory: action.tickHistory,
        finishOrder: action.finishOrder,
        betOutcome: action.betOutcome,
        animationTick: 0,
      }
    }

    case 'set_animation_tick': {
      if (state.phase !== 'racing') return state
      return { ...state, animationTick: action.tick }
    }

    case 'complete_race': {
      if (state.phase !== 'racing') return state
      return { ...state, phase: 'resolved' }
    }

    case 'new_race': {
      if (state.phase !== 'resolved') return state
      return {
        ...createInitialState(),
        betType: state.betType,
        selection: clearSlotsBeyond(state, getRequiredSlotCount(state)),
        betAmount: state.betAmount,
      }
    }

    default:
      return state
  }
}

export function toSnapshot(state: FroggiesState): FroggiesSnapshot {
  return {
    phase: state.phase,
    betType: state.betType,
    selection: [...state.selection],
    betAmount: state.betAmount,
    tickHistory: state.tickHistory ? state.tickHistory.map((tick) => ({ ...tick })) : null,
    finishOrder: state.finishOrder ? [...state.finishOrder] : null,
    betOutcome: state.betOutcome ? { ...state.betOutcome } : null,
    animationTick: state.animationTick,
    canStartRace: canStartRace(state),
  }
}

export function createBetOutcome(
  amount: number,
  payout: number,
): BetOutcome {
  return {
    won: payout > 0,
    payout,
    net: payout - amount,
  }
}
