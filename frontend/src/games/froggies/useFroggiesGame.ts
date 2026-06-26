import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import {
  canStartRace,
  createBetOutcome,
  createInitialState,
  froggiesReducer,
  getActiveSelection,
  toSnapshot,
} from './gameLogic'
import { buildBet, evaluateBet, runRace } from './raceLogic'
import type { BetType, FrogColour } from './types'

const FROGTUNE_GAME_ID = 'froggies' as const
const frogtuneTxn = { frogtuneGameId: FROGTUNE_GAME_ID }

export function useFroggiesGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(froggiesReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setBetType = useCallback((betType: BetType) => {
    dispatch({ type: 'set_bet_type', betType })
  }, [])

  const setSlot = useCallback((index: number, frog: FrogColour | null) => {
    dispatch({ type: 'set_slot', index, frog })
  }, [])

  const setBetAmount = useCallback((amount: number) => {
    dispatch({ type: 'set_bet_amount', amount })
  }, [])

  const setAnimationTick = useCallback((tick: number) => {
    dispatch({ type: 'set_animation_tick', tick })
  }, [])

  const startRace = useCallback(async () => {
    const current = stateRef.current
    if (!canStartRace(current)) return false
    if (wallet.balance < current.betAmount) return false

    const spent = await spendTadpoles(current.betAmount, frogtuneTxn)
    if (!spent) return false

    const { tickHistory, finishOrder } = runRace()
    const bet = buildBet(
      current.betType,
      getActiveSelection(current),
      current.betAmount,
    )
    const payout = evaluateBet(bet, { finishOrder })
    const betOutcome = createBetOutcome(current.betAmount, payout)

    dispatch({
      type: 'start_race',
      tickHistory,
      finishOrder,
      betOutcome,
    })
    return true
  }, [spendTadpoles, wallet.balance])

  const completeRace = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'racing') return

    if (current.betOutcome && current.betOutcome.payout > 0) {
      await addTadpoles(current.betOutcome.payout, frogtuneTxn)
    }

    dispatch({ type: 'complete_race' })
  }, [addTadpoles])

  const newRace = useCallback(() => {
    dispatch({ type: 'new_race' })
  }, [])

  const snapshot = toSnapshot(state)

  return {
    snapshot,
    wallet,
    setBetType,
    setSlot,
    setBetAmount,
    setAnimationTick,
    startRace,
    completeRace,
    newRace,
  }
}
