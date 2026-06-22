import { useCallback, useReducer, useRef } from 'react'
import { useWallet } from '../../wallet/useWallet'
import type { Bet } from './bets'
import { getBoostTadpoleCost } from './boost'
import {
  createInitialState,
  rouletteReducer,
  toSnapshot,
  totalWager,
} from './gameLogic'
import { pickBoostedPocket } from './multiplier'
import { spinPocket } from './spin'

const FROGTUNE_GAME_ID = 'roulette' as const
const frogtuneTxn = { frogtuneGameId: FROGTUNE_GAME_ID }

export function useRouletteGame() {
  const { spendTadpoles, addTadpoles, wallet } = useWallet()
  const [state, dispatch] = useReducer(rouletteReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  stateRef.current = state

  const setChip = useCallback((amount: number) => {
    dispatch({ type: 'set_chip', amount })
  }, [])

  const setBoostAmount = useCallback((amount: number) => {
    dispatch({ type: 'set_boost_amount', amount })
  }, [])

  const placeBet = useCallback((bet: Bet) => {
    dispatch({ type: 'place_bet', bet })
  }, [])

  const clearBets = useCallback(() => {
    dispatch({ type: 'clear_bets' })
  }, [])

  const removeBetZone = useCallback((zoneKey: string) => {
    dispatch({ type: 'remove_bet_zone', zoneKey })
  }, [])

  const rebet = useCallback(() => {
    dispatch({ type: 'rebet' })
  }, [])

  const spin = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'betting') return false
    if (current.pendingBets.length === 0) return false

    const wager = totalWager(current)
    const spent = await spendTadpoles(wager, frogtuneTxn)
    if (!spent) return false

    const result = spinPocket()
    const boostedPocket =
      getBoostTadpoleCost(current.boostAmount) > 0 ? pickBoostedPocket() : undefined

    dispatch({ type: 'spin', spinResult: result, boostedPocket })
    return true
  }, [spendTadpoles])

  const completeRound = useCallback(async () => {
    const current = stateRef.current
    if (current.phase !== 'revealing') return

    const totalPayout =
      current.betOutcomes?.reduce((sum, o) => sum + o.payout, 0) ?? 0
    if (totalPayout > 0) {
      await addTadpoles(totalPayout, frogtuneTxn)
    }

    dispatch({ type: 'complete_round' })
  }, [addTadpoles])

  const snapshot = toSnapshot(state)

  return {
    snapshot,
    wallet,
    setChip,
    setBoostAmount,
    placeBet,
    clearBets,
    removeBetZone,
    rebet,
    spin,
    completeRound,
  }
}
