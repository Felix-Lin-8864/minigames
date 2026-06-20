import { createContext } from 'react'
import type { GameStats } from './types'

export interface StatsContextValue {
  stats: Record<string, GameStats>
  loading: boolean
  updateStats: (gameId: string, update: Partial<GameStats>) => Promise<void>
  refreshStats: () => Promise<void>
}

export const StatsContext = createContext<StatsContextValue | null>(null)
