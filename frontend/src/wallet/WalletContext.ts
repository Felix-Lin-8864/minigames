import { createContext } from 'react'
import type { TadpoleEarningGameId, TadpoleRewardContext } from './tadpoleRewards'
import type { TadpoleTransactionOptions } from './WalletService'
import type { Wallet } from './types'

export interface WalletContextValue {
  wallet: Wallet
  loading: boolean
  addTadpoles: (amount: number, options?: TadpoleTransactionOptions) => Promise<Wallet>
  spendTadpoles: (amount: number, options?: TadpoleTransactionOptions) => Promise<Wallet | null>
  creditTadpolesForGame: (
    gameId: TadpoleEarningGameId,
    score: number,
    context?: TadpoleRewardContext,
  ) => Promise<number>
  refreshWallet: () => Promise<void>
}

export const WalletContext = createContext<WalletContextValue | null>(null)
