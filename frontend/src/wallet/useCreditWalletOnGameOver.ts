import { useEffect, useRef } from 'react'
import type { TadpoleEarningGameId } from './tadpoleRewards'
import { useWallet } from './useWallet'

export function useCreditWalletOnGameOver(
  gameId: TadpoleEarningGameId,
  status: string,
  score: number,
) {
  const { creditTadpolesForGame } = useWallet()
  const creditedRef = useRef(false)

  useEffect(() => {
    if (status === 'playing') {
      creditedRef.current = false
    }
  }, [status])

  useEffect(() => {
    if (status !== 'gameover' || creditedRef.current) return

    creditedRef.current = true
    void creditTadpolesForGame(gameId, score)
  }, [status, score, gameId, creditTadpolesForGame])
}
