import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { localStorageStatsService } from './localStorageStatsService'
import type { StatsService } from './StatsService'
import { StatsContext } from './StatsContext'
import type { GameStats } from './types'

interface StatsProviderProps {
  children: ReactNode
  service?: StatsService
}

export function StatsProvider({
  children,
  service = localStorageStatsService,
}: StatsProviderProps) {
  const [stats, setStats] = useState<Record<string, GameStats>>({})
  const [loading, setLoading] = useState(true)

  const refreshStats = useCallback(async () => {
    const allStats = await service.getAllStats()
    setStats(allStats)
  }, [service])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const allStats = await service.getAllStats()
      if (!cancelled) {
        setStats(allStats)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [service])

  const updateStats = useCallback(
    async (gameId: string, update: Partial<GameStats>) => {
      await service.updateGameStats(gameId, update)
      await refreshStats()
    },
    [service, refreshStats],
  )

  const value = useMemo(
    () => ({ stats, loading, updateStats, refreshStats }),
    [stats, loading, updateStats, refreshStats],
  )

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  )
}
