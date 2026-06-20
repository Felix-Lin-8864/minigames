import type { Wallet } from './types'

export interface WalletService {
  getWallet(): Promise<Wallet>
  addTadpoles(amount: number): Promise<Wallet>
  spendTadpoles(amount: number): Promise<Wallet | null>
}
