import type { Wallet } from './types'

export interface TadpoleTransactionOptions {
  frogtuneGameId?: string
}

export interface WalletService {
  getWallet(): Promise<Wallet>
  addTadpoles(amount: number, options?: TadpoleTransactionOptions): Promise<Wallet>
  spendTadpoles(amount: number, options?: TadpoleTransactionOptions): Promise<Wallet | null>
}
