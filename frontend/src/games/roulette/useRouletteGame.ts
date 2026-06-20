import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import type { Bet } from './bets'
import {
  createInitialState,
  rouletteReducer,
  toSnapshot,
  totalStaked,
} from './gameLogic'
import { spinPocket } from './spin'

export function useRouletteGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(rouletteReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setChip = useCallback((amount: number) => {
    dispatch({ type: 'set_chip', amount })
  }, [])

  const placeBet = useCallback((bet: Bet) => {
    dispatch({ type: 'place_bet', bet })
  }, [])

  const clearBets = useCallback(() => {
    dispatch({ type: 'clear_bets' })
  }, [])

  const rebet = useCallback(() => {
    dispatch({ type: 'rebet' })
  }, [])

  const spin = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'betting') return false
    if (current.pendingBets.length === 0) return false

    const stake = totalStaked(current)
    const spent = await spendTadpoles(stake)
    if (!spent) return false

    const result = spinPocket()
    dispatch({ type: 'spin', spinResult: result })
    return true
  }, [spendTadpoles])

  const completeRound = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'revealing') return

    const totalPayout =
      current.betOutcomes?.reduce((sum, o) => sum + o.payout, 0) ?? 0
    if (totalPayout > 0) {
      await addTadpoles(totalPayout)
    }

    dispatch({ type: 'complete_round' })
  }, [addTadpoles])

  const snapshot = toSnapshot(state)

  return {
    snapshot,
    wallet,
    setChip,
    placeBet,
    clearBets,
    rebet,
    spin,
    completeRound,
  }
}
