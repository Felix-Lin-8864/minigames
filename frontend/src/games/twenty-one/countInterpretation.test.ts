import { describe, expect, it } from 'vitest'
import { MIN_BET, SHOE_SIZE } from './constants'
import {
  estimatedEdgePercent,
  getCountInterpretation,
  unitsForTrueCount,
} from './countInterpretation'
import { createShoe } from './shoe'

describe('unitsForTrueCount', () => {
  it('maps true count tiers to bet units', () => {
    expect(unitsForTrueCount(0)).toBe(1)
    expect(unitsForTrueCount(1)).toBe(1)
    expect(unitsForTrueCount(2)).toBe(2)
    expect(unitsForTrueCount(3)).toBe(4)
    expect(unitsForTrueCount(4)).toBe(6)
    expect(unitsForTrueCount(5)).toBe(8)
    expect(unitsForTrueCount(10)).toBe(8)
  })
})

describe('estimatedEdgePercent', () => {
  it('matches the rule-of-thumb formula', () => {
    expect(estimatedEdgePercent(-2)).toBe(-1.5)
    expect(estimatedEdgePercent(-1)).toBe(-1)
    expect(estimatedEdgePercent(0)).toBe(-0.5)
    expect(estimatedEdgePercent(1)).toBe(0)
    expect(estimatedEdgePercent(3)).toBe(1)
    expect(estimatedEdgePercent(4)).toBe(1.5)
  })
})

describe('getCountInterpretation', () => {
  it('at true count 0 uses cold-shoe label and -0.5% edge once enough cards are dealt', () => {
    const result = getCountInterpretation(0, MIN_BET, 26)
    expect(result.ready).toBe(true)
    expect(result.label).toBe('Cold shoe — bet minimum')
    expect(result.estimatedEdgePercent).toBe(-0.5)
    expect(result.suggestedBet).toBe(MIN_BET)
  })

  it('scales suggested bet linearly with minimumBet', () => {
    expect(getCountInterpretation(3, 1, 26).suggestedBet).toBe(4)
    expect(getCountInterpretation(3, 2, 26).suggestedBet).toBe(8)
    expect(getCountInterpretation(3, 5, 26).suggestedBet).toBe(20)
  })

  it('gates interpretation early in a fresh shoe', () => {
    const result = getCountInterpretation(4, MIN_BET, 10)
    expect(result.ready).toBe(false)
    expect(result.label).toBe('Reading the shoe…')
    expect(result.suggestedBet).toBe(MIN_BET)
    expect(result.estimatedEdgePercent).toBe(-0.5)
  })

  it('resets to true-count-0 interpretation immediately after reshuffle', () => {
    let shoe = createShoe(() => 0.5)
    for (let i = 0; i < 30; i += 1) {
      shoe.discardPile.push({ suit: 'hearts', rank: '5', faceUp: true })
      shoe.runningCount += 1
    }

    const dealt = shoe.discardPile.length
    expect(getCountInterpretation(shoe.runningCount / (shoe.queue.length / 52), MIN_BET, dealt).ready).toBe(true)

    shoe = createShoe(() => 0.5)
    expect(shoe.runningCount).toBe(0)
    expect(shoe.discardPile.length).toBe(0)
    expect(shoe.queue.length).toBe(SHOE_SIZE)

    const afterReshuffle = getCountInterpretation(0, MIN_BET, shoe.discardPile.length)
    expect(afterReshuffle.ready).toBe(false)
    expect(afterReshuffle.label).toBe('Reading the shoe…')
    expect(afterReshuffle.estimatedEdgePercent).toBe(-0.5)
  })
})
