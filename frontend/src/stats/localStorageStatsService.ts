import type { StatsService } from './StatsService'
import { createEmptyGameStats, type GameStats } from './types'
import { gameMetadata } from '../games/metadata'

const STORAGE_KEY = 'minigames:stats'

function readStore(): Record<string, GameStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, GameStats>
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, GameStats>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function defaultStatsForGame(gameId: string): GameStats | null {
  const game = gameMetadata.find((g) => g.id === gameId)
  if (!game) return null
  return createEmptyGameStats(
    gameId,
    game.statFields.map((f) => f.key),
  )
}

export const localStorageStatsService: StatsService = {
  async getAllStats() {
    const store = readStore()
    const result: Record<string, GameStats> = {}

    for (const game of gameMetadata) {
      result[game.id] =
        store[game.id] ??
        createEmptyGameStats(
          game.id,
          game.statFields.map((f) => f.key),
        )
    }

    return result
  },

  async getGameStats(gameId) {
    const store = readStore()
    return store[gameId] ?? defaultStatsForGame(gameId)
  },

  async updateGameStats(gameId, update) {
    const store = readStore()
    const existing =
      store[gameId] ?? defaultStatsForGame(gameId) ?? { gameId, values: {}, lastPlayedAt: null }

    store[gameId] = {
      ...existing,
      ...update,
      gameId,
      values: { ...existing.values, ...update.values },
    }

    writeStore(store)
  },
}
