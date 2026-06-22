import type { WalletService, TadpoleTransactionOptions } from './WalletService'
import { adjustFrogtuneNet } from './frogtuneNet'
import { normalizeTadpoles } from './tadpoleAmount'
import { createEmptyWallet, type Wallet } from './types'

const STORAGE_KEY = 'minigames:wallet'

function normalizeWallet(parsed: Partial<Wallet>): Wallet {
  const balance = Math.max(0, normalizeTadpoles(parsed.balance ?? 0))
  const allTimeHigh = Math.max(
    balance,
    Math.max(0, normalizeTadpoles(parsed.allTimeHigh ?? balance)),
  )
  const frogtuneNet = Object.fromEntries(
    Object.entries(parsed.frogtuneNet ?? {}).map(([gameId, net]) => [
      gameId,
      normalizeTadpoles(net),
    ]),
  )

  return {
    balance,
    allTimeHigh,
    frogtuneNet,
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

  async addTadpoles(amount, options) {
    const earned = normalizeTadpoles(Math.max(0, amount))
    if (earned === 0) return readWallet()

    const wallet = readWallet()
    const balance = wallet.balance + earned
    const next: Wallet = {
      balance,
      allTimeHigh: Math.max(wallet.allTimeHigh, balance),
      frogtuneNet: options?.frogtuneGameId
        ? adjustFrogtuneNet(wallet.frogtuneNet, options.frogtuneGameId, earned)
        : wallet.frogtuneNet,
      lastUpdatedAt: new Date().toISOString(),
    }
    writeWallet(next)
    return next
  },

  async spendTadpoles(amount, options) {
    const cost = normalizeTadpoles(Math.max(0, amount))
    if (cost === 0) return readWallet()

    const wallet = readWallet()
    if (wallet.balance < cost) return null

    const next: Wallet = {
      balance: wallet.balance - cost,
      allTimeHigh: wallet.allTimeHigh,
      frogtuneNet: options?.frogtuneGameId
        ? adjustFrogtuneNet(wallet.frogtuneNet, options.frogtuneGameId, -cost)
        : wallet.frogtuneNet,
      lastUpdatedAt: new Date().toISOString(),
    }
    writeWallet(next)
    return next
  },
}
