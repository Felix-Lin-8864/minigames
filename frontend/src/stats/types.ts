export type StatFormat = 'score' | 'time' | 'duration'

export interface StatField {
  key: string
  label: string
  format: StatFormat
}

export interface GameStats {
  gameId: string
  values: Record<string, number | null>
  lastPlayedAt: string | null
}

export function createEmptyGameStats(
  gameId: string,
  statKeys: string[],
): GameStats {
  return {
    gameId,
    values: Object.fromEntries(statKeys.map((key) => [key, null])),
    lastPlayedAt: null,
  }
}

export function formatStatValue(
  value: number | null | undefined,
  format: StatFormat,
): string {
  if (value == null) return '—'

  switch (format) {
    case 'score':
      return value.toLocaleString()
    case 'time': {
      const minutes = Math.floor(value / 60)
      const seconds = (value % 60).toFixed(1)
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    }
    case 'duration':
      return `${Math.round(value)}ms`
  }
}
