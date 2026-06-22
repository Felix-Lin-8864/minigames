import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { localStorageWalletService } from './localStorageWalletService'
import { tadpolesEarnedForGame, type TadpoleRewardContext } from './tadpoleRewards'
import type { WalletService } from './WalletService'
import { WalletContext } from './WalletContext'
import { createEmptyWallet, type Wallet } from './types'

interface WalletProviderProps {
  children: ReactNode
  service?: WalletService
}

export function WalletProvider({
  children,
  service = localStorageWalletService,
}: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet>(createEmptyWallet())
  const [loading, setLoading] = useState(true)

  const refreshWallet = useCallback(async () => {
    const nextWallet = await service.getWallet()
    setWallet(nextWallet)
  }, [service])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const nextWallet = await service.getWallet()
      if (!cancelled) {
        setWallet(nextWallet)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [service])

  const addTadpoles = useCallback(
    async (amount: number, options?: Parameters<WalletService['addTadpoles']>[1]) => {
      const nextWallet = await service.addTadpoles(amount, options)
      setWallet(nextWallet)
      return nextWallet
    },
    [service],
  )

  const spendTadpoles = useCallback(
    async (amount: number, options?: Parameters<WalletService['spendTadpoles']>[1]) => {
      const nextWallet = await service.spendTadpoles(amount, options)
      if (nextWallet) setWallet(nextWallet)
      return nextWallet
    },
    [service],
  )

  const creditTadpolesForGame = useCallback(
    async (
      gameId: Parameters<typeof tadpolesEarnedForGame>[0],
      score: number,
      context?: TadpoleRewardContext,
    ) => {
      const earned = tadpolesEarnedForGame(gameId, score, context)
      if (earned > 0) await addTadpoles(earned)
      return earned
    },
    [addTadpoles],
  )

  const value = useMemo(
    () => ({
      wallet,
      loading,
      addTadpoles,
      spendTadpoles,
      creditTadpolesForGame,
      refreshWallet,
    }),
    [wallet, loading, addTadpoles, spendTadpoles, creditTadpolesForGame, refreshWallet],
  )

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}
