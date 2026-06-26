import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import {
  baccaratReducer,
  canDeal,
  createInitialState,
  isValidBetAmount,
  toSnapshot,
} from './gameLogic'
import type { BaccaratBetType, BaccaratSnapshot } from './types'

const FROGTUNE_GAME_ID = 'baccarat' as const
const frogtuneTxn = { frogtuneGameId: FROGTUNE_GAME_ID }

export function useBaccaratGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(baccaratReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setBetType = useCallback((betType: BaccaratBetType) => {
    dispatch({ type: 'set_bet_type', betType })
  }, [])

  const setBetAmount = useCallback((amount: number) => {
    dispatch({ type: 'set_bet_amount', amount })
  }, [])

  const deal = useCallback(async () => {
    const current = stateRef.current
    if (!canDeal(current)) return false
    if (!isValidBetAmount(current.pendingBet)) return false
    if (wallet.balance < current.pendingBet) return false

    const spent = await spendTadpoles(current.pendingBet, frogtuneTxn)
    if (!spent) return false

    dispatch({
      type: 'deal',
      betType: current.pendingBetType,
      amount: current.pendingBet,
    })
    return true
  }, [spendTadpoles, wallet.balance])

  const finishDealing = useCallback(() => {
    dispatch({ type: 'finish_dealing' })
  }, [])

  const creditWinnings = useCallback(
    async (snapshot: BaccaratSnapshot) => {
      if (snapshot.payout > 0) {
        await addTadpoles(snapshot.payout, frogtuneTxn)
      }
    },
    [addTadpoles],
  )

  return {
    snapshot: toSnapshot(state),
    wallet,
    setBetType,
    setBetAmount,
    deal,
    finishDealing,
    creditWinnings,
  }
}
