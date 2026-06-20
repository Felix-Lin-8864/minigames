import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { localStorageWalletService } from './localStorageWalletService'

const STORAGE_KEY = 'minigames:wallet'

function createLocalStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('localStorageWalletService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('tracks all-time high when balance increases', async () => {
    await localStorageWalletService.addTadpoles(50)
    await localStorageWalletService.addTadpoles(30)

    const wallet = await localStorageWalletService.getWallet()
    expect(wallet.balance).toBe(80)
    expect(wallet.allTimeHigh).toBe(80)
  })

  it('keeps all-time high after spending', async () => {
    await localStorageWalletService.addTadpoles(100)
    await localStorageWalletService.spendTadpoles(40)

    const wallet = await localStorageWalletService.getWallet()
    expect(wallet.balance).toBe(60)
    expect(wallet.allTimeHigh).toBe(100)
  })

  it('credits half-tadpole blackjack winnings', async () => {
    await localStorageWalletService.addTadpoles(1)
    await localStorageWalletService.addTadpoles(1.5)

    const wallet = await localStorageWalletService.getWallet()
    expect(wallet.balance).toBe(2.5)
  })

  it('backfills all-time high from existing balance', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ balance: 42, lastUpdatedAt: '2026-01-01T00:00:00.000Z' }),
    )

    const wallet = await localStorageWalletService.getWallet()
    expect(wallet.balance).toBe(42)
    expect(wallet.allTimeHigh).toBe(42)
  })
})
