import { describe, expect, it } from 'vitest'
import { createCard } from '../cards/pool'
import { createShoe } from '../cards/shoe'
import { SHOE_SIZE } from '../cards/constants'
import { playHand } from './playHand'

function deterministicRandom(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]!
    index += 1
    return value
  }
}

describe('playHand', () => {
  it('deals from the front of the queue without mid-hand RNG', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    const expected = [
      shoe.queue[0],
      shoe.queue[1],
      shoe.queue[2],
      shoe.queue[3],
    ]

    const result = playHand(shoe)

    expect(result.playerCards[0]?.rank).toBe(expected[0]?.rank)
    expect(result.bankerCards[0]?.rank).toBe(expected[1]?.rank)
    expect(result.playerCards[1]?.rank).toBe(expected[2]?.rank)
    expect(result.bankerCards[1]?.rank).toBe(expected[3]?.rank)
  })

  it('never draws third cards after a natural', () => {
    const shoe = {
      queue: [
        createCard('hearts', '9'),
        createCard('spades', '9'),
        createCard('clubs', 'K'),
        createCard('diamonds', 'K'),
      ],
      discardPile: [],
      handsCompleted: 0,
    }

    const result = playHand(shoe)
    expect(result.playerCards).toHaveLength(2)
    expect(result.bankerCards).toHaveLength(2)
    expect(result.outcome).toBe('tie')
  })

  it('maintains shoe integrity after a hand', () => {
    const shoe = createShoe(deterministicRandom([0.5]))
    const result = playHand(shoe)
    const remaining = result.shoe.queue.length + result.shoe.discardPile.length
    expect(remaining).toBe(SHOE_SIZE)
  })

  it('deals a third player card when rules require it', () => {
    const shoe = {
      queue: [
        createCard('hearts', '2'),
        createCard('spades', '2'),
        createCard('clubs', '3'),
        createCard('diamonds', '3'),
        createCard('hearts', '4'),
        createCard('spades', 'K'),
      ],
      discardPile: [],
      handsCompleted: 0,
    }

    const result = playHand(shoe)
    expect(result.playerCards.length).toBe(3)
    expect(result.playerCards[2]?.rank).toBe('4')
  })
})
