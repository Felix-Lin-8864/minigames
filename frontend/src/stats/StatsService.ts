import type { GameStats } from './types'

export interface StatsService {
  getAllStats(): Promise<Record<string, GameStats>>
  getGameStats(gameId: string): Promise<GameStats | null>
  updateGameStats(gameId: string, update: Partial<GameStats>): Promise<void>
}
