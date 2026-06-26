import { describe, expect, it } from 'vitest'
import { createShoe } from '../cards/shoe'
import { playHand } from './playHand'

describe('outcome distribution simulation', () => {
  it('matches standard punto banco frequencies over 100k hands', () => {
    const hands = 100_000
    let shoe = createShoe()
    const counts = { player: 0, banker: 0, tie: 0 }

    for (let i = 0; i < hands; i += 1) {
      if (shoe.queue.length < 6) {
        shoe = createShoe()
      }
      const result = playHand(shoe)
      shoe = result.shoe
      counts[result.outcome] += 1
    }

    const playerRate = counts.player / hands
    const bankerRate = counts.banker / hands
    const tieRate = counts.tie / hands

    expect(bankerRate).toBeGreaterThanOrEqual(0.4486)
    expect(bankerRate).toBeLessThanOrEqual(0.4686)
    expect(playerRate).toBeGreaterThanOrEqual(0.4362)
    expect(playerRate).toBeLessThanOrEqual(0.4562)
    expect(tieRate).toBeGreaterThanOrEqual(0.0852)
    expect(tieRate).toBeLessThanOrEqual(0.1052)
  })
})
