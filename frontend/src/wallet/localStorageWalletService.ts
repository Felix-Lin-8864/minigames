import type { WalletService } from './WalletService'
import { createEmptyWallet, type Wallet } from './types'

const STORAGE_KEY = 'minigames:wallet'

function normalizeWallet(parsed: Partial<Wallet>): Wallet {
  const balance = Math.max(0, Math.floor(parsed.balance ?? 0))
  const allTimeHigh = Math.max(
    balance,
    Math.max(0, Math.floor(parsed.allTimeHigh ?? balance)),
  )

  return {
    balance,
    allTimeHigh,
    lastUpdatedAt: parsed.lastUpdatedAt ?? null,
  }
}

function readWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyWallet()
    return normalizeWallet(JSON.parse(raw) as Partial<Wallet>)
  } catch {
    return createEmptyWallet()
  }
}

function writeWallet(wallet: Wallet): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet))
}

export const localStorageWalletService: WalletService = {
  async getWallet() {
    return readWallet()
  },

  async addTadpoles(amount) {
    const earned = Math.max(0, Math.floor(amount))
    if (earned === 0) return readWallet()

    const wallet = readWallet()
    const balance = wallet.balance + earned
    const next: Wallet = {
      balance,
      allTimeHigh: Math.max(wallet.allTimeHigh, balance),
      lastUpdatedAt: new Date().toISOString(),
    }
    writeWallet(next)
    return next
  },

  async spendTadpoles(amount) {
    const cost = Math.max(0, Math.floor(amount))
    if (cost === 0) return readWallet()

    const wallet = readWallet()
    if (wallet.balance < cost) return null

    const next: Wallet = {
      balance: wallet.balance - cost,
      allTimeHigh: wallet.allTimeHigh,
      lastUpdatedAt: new Date().toISOString(),
    }
    writeWallet(next)
    return next
  },
}
