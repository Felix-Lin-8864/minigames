import { describe, expect, it } from 'vitest'
import {
  createEmptySessionStats,
  recordSpin,
  sessionNet,
  sessionRtp,
  winRate,
} from './sessionStats'

describe('sessionStats', () => {
  it('tracks spins, wins, and losses', () => {
    let stats = createEmptySessionStats()
    stats = recordSpin(stats, 5, 10)
    stats = recordSpin(stats, 5, 0)
    stats = recordSpin(stats, 10, 50)

    expect(stats.spins).toBe(3)
    expect(stats.wins).toBe(2)
    expect(stats.losses).toBe(1)
    expect(stats.totalWagered).toBe(20)
    expect(stats.totalWon).toBe(60)
    expect(stats.biggestWin).toBe(50)
    expect(sessionNet(stats)).toBe(40)
    expect(sessionRtp(stats)).toBeCloseTo(3)
    expect(winRate(stats)).toBeCloseTo(2 / 3)
  })

  it('returns null rates before any spins', () => {
    const stats = createEmptySessionStats()
    expect(sessionRtp(stats)).toBeNull()
    expect(winRate(stats)).toBeNull()
    expect(sessionNet(stats)).toBe(0)
  })
})
