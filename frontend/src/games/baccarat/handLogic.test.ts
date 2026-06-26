import { describe, expect, it } from 'vitest'
import { createCard } from '../cards/pool'
import {
  baccaratCardValue,
  evaluateBet,
  handTotal,
  isNatural,
  resolveHand,
  shouldBankerDraw,
  shouldPlayerDraw,
} from './handLogic'

describe('baccaratCardValue', () => {
  it('maps ranks to baccarat point values', () => {
    expect(baccaratCardValue('A')).toBe(1)
    expect(baccaratCardValue('7')).toBe(7)
    expect(baccaratCardValue('10')).toBe(0)
    expect(baccaratCardValue('K')).toBe(0)
  })
})

describe('handTotal', () => {
  it('returns values in 0–9 for two-card hands', () => {
    for (let i = 0; i < 200; i += 1) {
      const c1 = createCard('hearts', ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][i % 13]!)
      const c2 = createCard('spades', ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][(i * 3) % 13]!)
      const total = handTotal([c1, c2])
      expect(total).toBeGreaterThanOrEqual(0)
      expect(total).toBeLessThanOrEqual(9)
    }
  })

  it('sums mod 10', () => {
    expect(handTotal([createCard('hearts', '7'), createCard('spades', '8')])).toBe(5)
    expect(handTotal([createCard('hearts', '9'), createCard('spades', '9')])).toBe(8)
  })
})

describe('isNatural', () => {
  it('is true only for 8 and 9', () => {
    expect(isNatural(8)).toBe(true)
    expect(isNatural(9)).toBe(true)
    expect(isNatural(7)).toBe(false)
    expect(isNatural(0)).toBe(false)
  })
})

describe('shouldPlayerDraw', () => {
  it.each([
    [0, true],
    [5, true],
    [6, false],
    [7, false],
    [8, false],
    [9, false],
  ])('total %i → %s', (total, expected) => {
    expect(shouldPlayerDraw(total)).toBe(expected)
  })
})

describe('shouldBankerDraw when player stood', () => {
  it.each([
    [0, true],
    [5, true],
    [6, false],
    [7, false],
  ])('banker total %i → draw=%s', (bankerTotal, expected) => {
    expect(shouldBankerDraw(bankerTotal, false, null)).toBe(expected)
  })
})

describe('shouldBankerDraw when player drew third card', () => {
  it.each([0, 1, 2])('banker %i always draws', (bankerTotal) => {
    for (let third = 0; third <= 9; third += 1) {
      expect(shouldBankerDraw(bankerTotal, true, third)).toBe(true)
    }
  })

  it('banker 3 draws except when player third is 8', () => {
    for (let third = 0; third <= 9; third += 1) {
      expect(shouldBankerDraw(3, true, third)).toBe(third !== 8)
    }
  })

  it('banker 4 draws on player third 2–7 only', () => {
    for (let third = 0; third <= 9; third += 1) {
      const expected = third >= 2 && third <= 7
      expect(shouldBankerDraw(4, true, third)).toBe(expected)
    }
  })

  it('banker 5 draws on player third 4–7 only', () => {
    for (let third = 0; third <= 9; third += 1) {
      const expected = third >= 4 && third <= 7
      expect(shouldBankerDraw(5, true, third)).toBe(expected)
    }
  })

  it('banker 6 draws on player third 6–7 only', () => {
    for (let third = 0; third <= 9; third += 1) {
      const expected = third === 6 || third === 7
      expect(shouldBankerDraw(6, true, third)).toBe(expected)
    }
  })

  it('banker 7 always stands', () => {
    for (let third = 0; third <= 9; third += 1) {
      expect(shouldBankerDraw(7, true, third)).toBe(false)
    }
  })
})

describe('resolveHand', () => {
  it('compares final totals', () => {
    const player = [createCard('hearts', '9'), createCard('spades', 'K')]
    const banker = [createCard('clubs', '8'), createCard('diamonds', 'K')]
    expect(resolveHand(player, banker)).toBe('player')
    expect(resolveHand(banker, player)).toBe('banker')
    expect(resolveHand(player, [createCard('clubs', '9'), createCard('diamonds', 'K')])).toBe('tie')
  })
})

describe('evaluateBet', () => {
  const stake = 100

  it('pays even money on Player win', () => {
    expect(evaluateBet({ type: 'player', amount: stake }, 'player')).toBe(200)
  })

  it('pays 0.95:1 on Banker win', () => {
    expect(evaluateBet({ type: 'banker', amount: stake }, 'banker')).toBe(195)
  })

  it('pushes Player/Banker bets on Tie', () => {
    expect(evaluateBet({ type: 'player', amount: stake }, 'tie')).toBe(stake)
    expect(evaluateBet({ type: 'banker', amount: stake }, 'tie')).toBe(stake)
  })

  it('pays 8:1 on Tie bet win', () => {
    expect(evaluateBet({ type: 'tie', amount: stake }, 'tie')).toBe(900)
  })

  it('returns 0 on losing bets', () => {
    expect(evaluateBet({ type: 'player', amount: stake }, 'banker')).toBe(0)
    expect(evaluateBet({ type: 'banker', amount: stake }, 'player')).toBe(0)
    expect(evaluateBet({ type: 'tie', amount: stake }, 'player')).toBe(0)
  })
})
