import { describe, expect, it } from 'vitest'
import { blackjackPayout } from './hand'

describe('blackjackPayout', () => {
  it('pays 3:2 profit on top of the returned bet', () => {
    expect(blackjackPayout(1)).toBe(2.5)
    expect(blackjackPayout(2)).toBe(5)
    expect(blackjackPayout(3)).toBe(7.5)
    expect(blackjackPayout(10)).toBe(25)
  })
})
