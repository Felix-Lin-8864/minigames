import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import {
  canDoubleHand,
  canPlayerAct,
  canSplitHand,
  createInitialState,
  toSnapshot,
  twentyOneReducer,
} from './gameLogic'
import { MIN_BET } from './constants'
import type { TwentyOneSnapshot } from './types'

export function useTwentyOneGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(twentyOneReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setBet = useCallback((bet: number) => {
    dispatch({ type: 'set_bet', bet })
  }, [])

  const deal = useCallback(async (bet: number) => {
    const current = stateRef.current
    if (current.phase !== 'betting' && current.phase !== 'resolved') return false
    if (!Number.isFinite(bet) || bet < MIN_BET) return false

    const spent = await spendTadpoles(bet)
    if (!spent) return false

    dispatch({ type: 'deal', bet })
    return true
  }, [spendTadpoles])

  const creditWinnings = useCallback(
    async (snapshot: TwentyOneSnapshot) => {
      const totalPayout = snapshot.playerHands.reduce((sum, hand) => sum + hand.payout, 0)
      if (totalPayout > 0) {
        await addTadpoles(totalPayout)
      }
    },
    [addTadpoles],
  )

  const hit = useCallback(() => {
    dispatch({ type: 'hit' })
  }, [])

  const stand = useCallback(() => {
    dispatch({ type: 'stand' })
  }, [])

  const doubleDown = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'playing') return false

    const hand = current.playerHands[current.activeHandIndex]
    if (!hand || !canDoubleHand(hand)) return false

    const additionalBet = hand.bet
    if (wallet.balance < additionalBet) return false

    dispatch({ type: 'double', additionalBet })

    const spent = await spendTadpoles(additionalBet)
    return spent != null
  }, [spendTadpoles, wallet.balance])

  const split = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'playing') return false

    const hand = current.playerHands[current.activeHandIndex]
    if (!hand || !canSplitHand(current, hand)) return false

    const additionalBet = hand.bet
    const spent = await spendTadpoles(additionalBet)
    if (!spent) return false

    dispatch({ type: 'split', additionalBet })
    return true
  }, [spendTadpoles])

  const snapshot = toSnapshot(state)
  const activeHand = state.playerHands[state.activeHandIndex]

  return {
    snapshot,
    setBet,
    deal,
    hit,
    stand,
    doubleDown,
    split,
    creditWinnings,
    canAct: canPlayerAct(state),
    canDouble: activeHand ? canDoubleHand(activeHand) : false,
    canSplit: activeHand ? canSplitHand(state, activeHand) : false,
  }
}
