import { useCallback, useReducer, useRef, useState } from 'react'
import { useWallet } from '../../wallet/useWallet'
import { MIN_BET } from './constants'
import {
  DEFAULT_CONFIG,
  createInitialState,
  evaluateSpin,
  slotsReducer,
  spinReels,
  toSnapshot,
} from './gameLogic'
import {
  createEmptySessionStats,
  recordSpin,
  type SlotsSessionStats,
} from './sessionStats'

export function useSlotsGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(slotsReducer, undefined, createInitialState)
  const [sessionStats, setSessionStats] = useState<SlotsSessionStats>(createEmptySessionStats)
  const stateRef = useRef(state)

  stateRef.current = state

  const setBet = useCallback((bet: number) => {
    dispatch({ type: 'set_bet', bet })
  }, [])

  const spin = useCallback(async (bet: number) => {
    const current = stateRef.current
    if (current.phase !== 'idle' && current.phase !== 'revealed') return false
    if (!Number.isFinite(bet) || bet < MIN_BET) return false
    if (wallet.balance < bet) return false

    const spent = await spendTadpoles(bet)
    if (!spent) return false

    const reels = spinReels(DEFAULT_CONFIG)
    const result = evaluateSpin(reels, bet, DEFAULT_CONFIG.payouts)
    dispatch({
      type: 'spin',
      bet,
      reels,
      payout: result.payout,
      multiplier: result.multiplier,
    })
    return true
  }, [spendTadpoles, wallet.balance])

  const completeSpin = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'spinning') return

    if (current.payout > 0) {
      await addTadpoles(current.payout)
    }

    setSessionStats((stats) => recordSpin(stats, current.bet, current.payout))
    dispatch({ type: 'complete_spin' })
  }, [addTadpoles])

  const snapshot = toSnapshot(state)

  return {
    snapshot,
    wallet,
    sessionStats,
    setBet,
    spin,
    completeSpin,
    canSpin:
      (snapshot.phase === 'idle' || snapshot.phase === 'revealed') &&
      wallet.balance >= MIN_BET,
    isSpinning: snapshot.phase === 'spinning',
  }
}
