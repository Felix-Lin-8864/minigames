import { createContext } from 'react'
import type { TadpoleEarningGameId } from './tadpoleRewards'
import type { Wallet } from './types'

export interface WalletContextValue {
  wallet: Wallet
  loading: boolean
  addTadpoles: (amount: number) => Promise<Wallet>
  spendTadpoles: (amount: number) => Promise<Wallet | null>
  creditTadpolesForGame: (
    gameId: TadpoleEarningGameId,
    score: number,
  ) => Promise<number>
  refreshWallet: () => Promise<void>
}

export const WalletContext = createContext<WalletContextValue | null>(null)
