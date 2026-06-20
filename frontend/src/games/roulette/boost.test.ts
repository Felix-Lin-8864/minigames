import { describe, expect, it } from 'vitest'
import { getBoostTadpoleCost } from './boost'
import { MIN_BET } from './constants'

describe('getBoostTadpoleCost', () => {
  it('returns 0 when boost is off or below minimum', () => {
    expect(getBoostTadpoleCost(0)).toBe(0)
    expect(getBoostTadpoleCost(MIN_BET - 1)).toBe(0)
  })

  it('costs tadpoles equal to the boost amount', () => {
    expect(getBoostTadpoleCost(5)).toBe(5)
    expect(getBoostTadpoleCost(20)).toBe(20)
  })
})
