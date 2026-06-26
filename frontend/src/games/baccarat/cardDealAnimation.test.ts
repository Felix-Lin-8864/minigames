import { describe, expect, it } from 'vitest'
import { createCard } from '../cards/pool'
import { visibleHandTotal } from './cardDealAnimation'

describe('visibleHandTotal', () => {
  it('returns null when no cards are visible', () => {
    const cards = [createCard('hearts', '7'), createCard('spades', '8')]
    expect(visibleHandTotal(cards, () => false)).toBeNull()
  })

  it('updates the total as cards become visible', () => {
    const c1 = createCard('hearts', '7')
    const c2 = createCard('spades', '8')
    const visible = new Set([c1])

    expect(visibleHandTotal([c1, c2], (card) => visible.has(card))).toBe(7)
    visible.add(c2)
    expect(visibleHandTotal([c1, c2], (card) => visible.has(card))).toBe(5)
  })
})
