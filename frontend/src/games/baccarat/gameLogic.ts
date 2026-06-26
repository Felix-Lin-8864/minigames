import { createShoe, completeHand } from '../cards/shoe'
import type { ShoeState } from '../cards/shoe'
import { BET_STEP, HANDS_PER_SHOE, MIN_BET } from './constants'
import { evaluateBet } from './handLogic'
import { playHand } from './playHand'
import type { BaccaratAction, BaccaratOutcome, BaccaratSnapshot, BaccaratState, SessionTally } from './types'

function emptyTally(): SessionTally {
  return { player: 0, banker: 0, tie: 0 }
}

export function createInitialState(shoe?: ShoeState): BaccaratState {
  return {
    phase: 'betting',
    pendingBetType: 'player',
    pendingBet: MIN_BET,
    betType: null,
    bet: 0,
    hand: null,
    outcome: null,
    payout: 0,
    lastHandNet: 0,
    message: null,
    sessionTally: emptyTally(),
    shoe: shoe ?? createShoe(),
    resolutionId: 0,
  }
}

export function isValidBetAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= MIN_BET && amount % BET_STEP === 0
}

export function isBettingPhase(phase: BaccaratState['phase']): boolean {
  return phase === 'betting' || phase === 'resolved'
}

export function canDeal(state: BaccaratState): boolean {
  return isBettingPhase(state.phase) && isValidBetAmount(state.pendingBet)
}

function outcomeMessage(
  outcome: BaccaratOutcome,
  payout: number,
  bet: number,
): string {
  const winner =
    outcome === 'player' ? 'Player wins' : outcome === 'banker' ? 'Banker wins' : 'Tie'

  if (payout === 0) return `${winner} — bet lost`
  if (payout === bet) return `${winner} — push`
  return `${winner} — payout ${payout}`
}

function closeResolvedHand(state: BaccaratState): BaccaratState {
  if (!state.outcome) return state

  const { shoe: nextShoe } = completeHand(state.shoe, HANDS_PER_SHOE)
  const sessionTally = incrementTally(state.sessionTally, state.outcome)

  return {
    ...createInitialState(nextShoe),
    pendingBetType: state.pendingBetType,
    pendingBet: state.pendingBet,
    sessionTally,
    resolutionId: state.resolutionId + 1,
  }
}

function startDeal(state: BaccaratState, betType: BaccaratState['pendingBetType'], amount: number): BaccaratState {
  const shoe = {
    queue: [...state.shoe.queue],
    discardPile: [...state.shoe.discardPile],
    handsCompleted: state.shoe.handsCompleted,
  }

  const result = playHand(shoe)
  const bet = { type: betType, amount }
  const payout = evaluateBet(bet, result.outcome)
  const lastHandNet = payout - amount

  return {
    ...state,
    phase: 'dealing',
    betType,
    bet: amount,
    hand: {
      playerCards: result.playerCards,
      bankerCards: result.bankerCards,
      playerTotal: result.playerTotal,
      bankerTotal: result.bankerTotal,
      outcome: result.outcome,
    },
    outcome: result.outcome,
    payout,
    lastHandNet,
    message: outcomeMessage(result.outcome, payout, amount),
    shoe: result.shoe,
  }
}

function incrementTally(tally: SessionTally, outcome: BaccaratOutcome): SessionTally {
  return {
    ...tally,
    [outcome]: tally[outcome] + 1,
  }
}

export function baccaratReducer(state: BaccaratState, action: BaccaratAction): BaccaratState {
  switch (action.type) {
    case 'set_bet_type': {
      if (!isBettingPhase(state.phase)) return state
      return { ...state, pendingBetType: action.betType }
    }

    case 'set_bet_amount': {
      if (!isBettingPhase(state.phase)) return state
      return { ...state, pendingBet: action.amount }
    }

    case 'deal': {
      if (!isBettingPhase(state.phase)) return state
      if (!isValidBetAmount(action.amount)) return state

      const baseState = state.phase === 'resolved' ? closeResolvedHand(state) : state
      return startDeal(baseState, action.betType, action.amount)
    }

    case 'finish_dealing': {
      if (state.phase !== 'dealing') return state
      return { ...state, phase: 'resolved' }
    }

    case 'next_hand': {
      if (state.phase !== 'resolved') return state
      if (!state.outcome) return state

      const { shoe: nextShoe } = completeHand(state.shoe, HANDS_PER_SHOE)
      const sessionTally = incrementTally(state.sessionTally, state.outcome)

      return {
        ...createInitialState(nextShoe),
        pendingBetType: state.pendingBetType,
        pendingBet: state.pendingBet,
        sessionTally,
        resolutionId: state.resolutionId + 1,
      }
    }

    default:
      return state
  }
}

export function toSnapshot(state: BaccaratState): BaccaratSnapshot {
  return {
    phase: state.phase,
    pendingBetType: state.pendingBetType,
    pendingBet: state.pendingBet,
    betType: state.betType,
    bet: state.bet,
    hand: state.hand,
    outcome: state.outcome,
    payout: state.payout,
    lastHandNet: state.lastHandNet,
    message: state.message,
    sessionTally: state.sessionTally,
    shoeHandsCompleted: state.shoe.handsCompleted,
    resolutionId: state.resolutionId,
    canDeal: canDeal(state),
  }
}
