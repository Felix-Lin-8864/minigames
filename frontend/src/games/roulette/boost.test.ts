import { describe, expect, it } from 'vitest'
import { getBoostTadpoleCost } from './boost'

describe('getBoostTadpoleCost', () => {
  it('returns 0 when boost is off', () => {
    expect(getBoostTadpoleCost(0)).toBe(0)
    expect(getBoostTadpoleCost(-1)).toBe(0)
  })

  it('costs tadpoles equal to the boost amount for any positive value', () => {
    expect(getBoostTadpoleCost(1)).toBe(1)
    expect(getBoostTadpoleCost(4)).toBe(4)
    expect(getBoostTadpoleCost(5)).toBe(5)
    expect(getBoostTadpoleCost(20)).toBe(20)
  })
})
