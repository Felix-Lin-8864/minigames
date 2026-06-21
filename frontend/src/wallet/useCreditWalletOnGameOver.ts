import { useCallback, useEffect, useRef, useState } from 'react'
import type { TadpoleEarningGameId, TadpoleRewardContext } from './tadpoleRewards'
import { useWallet } from './useWallet'

export function useCreditWalletOnGameOver(
  gameId: TadpoleEarningGameId,
  status: string,
  score: number,
  context?: TadpoleRewardContext,
) {
  const { creditTadpolesForGame } = useWallet()
  const creditedRef = useRef(false)
  const previousStatusRef = useRef(status)
  const scoreRef = useRef(score)
  const [earnedAmount, setEarnedAmount] = useState<number | null>(null)

  scoreRef.current = score

  useEffect(() => {
    const previousStatus = previousStatusRef.current
    previousStatusRef.current = status

    if (status === 'playing' || status === 'idle') {
      creditedRef.current = false
      setEarnedAmount(null)
      return
    }

    if (status !== 'gameover' || previousStatus === 'gameover' || creditedRef.current) {
      return
    }

    creditedRef.current = true
    void creditTadpolesForGame(gameId, scoreRef.current, context).then((earned) => {
      setEarnedAmount(earned)
    })
  }, [status, gameId, context, creditTadpolesForGame])

  const dismissNotification = useCallback(() => {
    setEarnedAmount(null)
  }, [])

  return {
    earnedAmount,
    showEarnedNotification: earnedAmount !== null,
    dismissNotification,
  }
}
