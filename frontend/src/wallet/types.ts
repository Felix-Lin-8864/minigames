export interface Wallet {
  balance: number
  allTimeHigh: number
  lastUpdatedAt: string | null
}

export function createEmptyWallet(): Wallet {
  return {
    balance: 0,
    allTimeHigh: 0,
    lastUpdatedAt: null,
  }
}
