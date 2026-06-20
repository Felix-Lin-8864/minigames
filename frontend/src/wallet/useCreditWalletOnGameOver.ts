import { useCallback, useEffect, useRef, useState } from 'react'
import type { TadpoleEarningGameId } from './tadpoleRewards'
import { useWallet } from './useWallet'

export function useCreditWalletOnGameOver(
  gameId: TadpoleEarningGameId,
  status: string,
  score: number,
) {
  const { creditTadpolesForGame } = useWallet()
  const creditedRef = useRef(false)
  const [earnedAmount, setEarnedAmount] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'playing' || status === 'idle') {
      creditedRef.current = false
      setEarnedAmount(null)
    }
  }, [status])

  useEffect(() => {
    if (status !== 'gameover' || creditedRef.current) return

    creditedRef.current = true
    void creditTadpolesForGame(gameId, score).then((earned) => {
      setEarnedAmount(earned)
    })
  }, [status, score, gameId, creditTadpolesForGame])

  const dismissNotification = useCallback(() => {
    setEarnedAmount(null)
  }, [])

  return {
    earnedAmount,
    showEarnedNotification: earnedAmount !== null,
    dismissNotification,
  }
}
