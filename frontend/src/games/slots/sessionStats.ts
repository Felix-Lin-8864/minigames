export interface SlotsSessionStats {
  spins: number
  wins: number
  losses: number
  totalWagered: number
  totalWon: number
  biggestWin: number
}

export function createEmptySessionStats(): SlotsSessionStats {
  return {
    spins: 0,
    wins: 0,
    losses: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
  }
}

export function recordSpin(
  stats: SlotsSessionStats,
  bet: number,
  payout: number,
): SlotsSessionStats {
  const won = payout > 0
  return {
    spins: stats.spins + 1,
    wins: stats.wins + (won ? 1 : 0),
    losses: stats.losses + (won ? 0 : 1),
    totalWagered: stats.totalWagered + bet,
    totalWon: stats.totalWon + payout,
    biggestWin: Math.max(stats.biggestWin, payout),
  }
}

export function sessionNet(stats: SlotsSessionStats): number {
  return stats.totalWon - stats.totalWagered
}

export function sessionRtp(stats: SlotsSessionStats): number | null {
  if (stats.totalWagered === 0) return null
  return stats.totalWon / stats.totalWagered
}

export function winRate(stats: SlotsSessionStats): number | null {
  if (stats.spins === 0) return null
  return stats.wins / stats.spins
}
