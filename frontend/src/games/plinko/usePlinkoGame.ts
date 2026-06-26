import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import { MIN_BET, ROWS } from './constants'
import {
  DEFAULT_CONFIG,
  createInitialState,
  evaluateDrop,
  plinkoReducer,
  simulateDrop,
  toSnapshot,
} from './gameLogic'
import type { RiskTier } from './types'

const FROGTUNE_GAME_ID = 'plinko' as const
const frogtuneTxn = { frogtuneGameId: FROGTUNE_GAME_ID }

export function usePlinkoGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(plinkoReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setBet = useCallback((bet: number) => {
    dispatch({ type: 'set_bet', bet })
  }, [])

  const setRisk = useCallback((risk: RiskTier) => {
    dispatch({ type: 'set_risk', risk })
  }, [])

  const drop = useCallback(async (bet: number, risk: RiskTier) => {
    const current = stateRef.current
    if (!Number.isFinite(bet) || bet < MIN_BET) return false
    if (wallet.balance < bet) return false

    const spent = await spendTadpoles(bet, frogtuneTxn)
    if (!spent) return false

    const { path, slot } = simulateDrop(ROWS)
    const result = evaluateDrop(slot, bet, risk, DEFAULT_CONFIG, path)
    const id = current.nextDropId
    dispatch({
      type: 'drop',
      id,
      bet,
      risk,
      path: result.path,
      slot: result.slot,
      payout: result.payout,
      multiplier: result.multiplier,
    })
    return true
  }, [spendTadpoles, wallet.balance])

  const completeDrop = useCallback(async (id: number) => {
    const current = stateRef.current
    const dropResult = current.activeDrops.find((d) => d.id === id)
    if (!dropResult) return

    if (dropResult.payout > 0) {
      await addTadpoles(dropResult.payout, frogtuneTxn)
    }

    dispatch({ type: 'complete_drop', id })
  }, [addTadpoles])

  const snapshot = toSnapshot(state)

  return {
    snapshot,
    wallet,
    setBet,
    setRisk,
    drop,
    completeDrop,
    activeDropCount: snapshot.activeDrops.length,
  }
}
