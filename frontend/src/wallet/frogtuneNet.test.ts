import { describe, expect, it } from 'vitest'
import { adjustFrogtuneNet } from './frogtuneNet'

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
