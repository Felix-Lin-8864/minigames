import { describe, expect, it } from 'vitest'
import { tadpolesEarnedForGame } from './tadpoleRewards'

describe('tadpolesEarnedForGame', () => {
  it('awards snake score as tadpoles', () => {
    expect(tadpolesEarnedForGame('snake', 0)).toBe(0)
    expect(tadpolesEarnedForGame('snake', 17)).toBe(17)
  })

  it('awards frogger score as tadpoles', () => {
    expect(tadpolesEarnedForGame('frogger', 42)).toBe(42)
  })

  it('awards anagrams score as ceiling(score / 400) tadpoles', () => {
    expect(tadpolesEarnedForGame('anagrams', 0)).toBe(0)
    expect(tadpolesEarnedForGame('anagrams', 399)).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 400)).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 401)).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 1200)).toBe(3)
  })
})
