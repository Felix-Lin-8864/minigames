import { describe, expect, it } from 'vitest'
import {
  adjustFrogtuneLosses,
  adjustFrogtuneNet,
  adjustFrogtuneWinnings,
  backfillFrogtuneWinningsLosses,
} from './frogtuneNet'

describe('adjustFrogtuneNet', () => {
  it('accumulates net changes per game', () => {
    let net: Record<string, number> = {}
    net = adjustFrogtuneNet(net, 'slots', -10)
    net = adjustFrogtuneNet(net, 'slots', 25)
    net = adjustFrogtuneNet(net, 'twenty-one', -20)
    net = adjustFrogtuneNet(net, 'twenty-one', 30)

    expect(net).toEqual({
      slots: 15,
      'twenty-one': 10,
    })
  })

  it('ignores zero deltas', () => {
    const net = { slots: 5 }
    expect(adjustFrogtuneNet(net, 'slots', 0)).toBe(net)
  })
})

describe('adjustFrogtuneWinnings', () => {
  it('accumulates winnings per game', () => {
    let winnings: Record<string, number> = {}
    winnings = adjustFrogtuneWinnings(winnings, 'slots', 25)
    winnings = adjustFrogtuneWinnings(winnings, 'slots', 10)

    expect(winnings).toEqual({ slots: 35 })
  })
})

describe('adjustFrogtuneLosses', () => {
  it('accumulates losses per game', () => {
    let losses: Record<string, number> = {}
    losses = adjustFrogtuneLosses(losses, 'slots', 10)
    losses = adjustFrogtuneLosses(losses, 'slots', 5)

    expect(losses).toEqual({ slots: 15 })
  })
})

describe('backfillFrogtuneWinningsLosses', () => {
  it('derives winnings and losses from net when missing', () => {
    expect(
      backfillFrogtuneWinningsLosses({ slots: 15, roulette: -8 }, {}, {}),
    ).toEqual({
      frogtuneWinnings: { slots: 15 },
      frogtuneLosses: { roulette: 8 },
    })
  })

  it('does not overwrite existing winnings or losses', () => {
    expect(
      backfillFrogtuneWinningsLosses(
        { slots: 15 },
        { slots: 25 },
        { slots: 10 },
      ),
    ).toEqual({
      frogtuneWinnings: { slots: 25 },
      frogtuneLosses: { slots: 10 },
    })
  })
})
