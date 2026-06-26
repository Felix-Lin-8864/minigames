export interface Wallet {
  balance: number
  allTimeHigh: number
  frogtuneNet: Record<string, number>
  frogtuneWinnings: Record<string, number>
  frogtuneLosses: Record<string, number>
  lastUpdatedAt: string | null
}

export function createEmptyWallet(): Wallet {
  return {
    balance: 0,
    allTimeHigh: 0,
    frogtuneNet: {},
    frogtuneWinnings: {},
    frogtuneLosses: {},
    lastUpdatedAt: null,
  }
}
