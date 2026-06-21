import { describe, expect, it } from 'vitest'
import { tadpolesEarnedForGame } from './tadpoleRewards'

describe('tadpolesEarnedForGame', () => {
  it('awards snake score divided by 4 as tadpoles', () => {
    expect(tadpolesEarnedForGame('snake', 0)).toBe(0)
    expect(tadpolesEarnedForGame('snake', 3)).toBe(0.75)
    expect(tadpolesEarnedForGame('snake', 4)).toBe(1)
    expect(tadpolesEarnedForGame('snake', 17)).toBe(4.25)
  })

  it('awards frogger score divided by 4 as tadpoles', () => {
    expect(tadpolesEarnedForGame('frogger', 42)).toBe(10.5)
  })

  it('awards stacker score divided by 4 as tadpoles', () => {
    expect(tadpolesEarnedForGame('stacker', 30)).toBe(7.5)
    expect(tadpolesEarnedForGame('stacker', 45)).toBe(11.25)
    expect(tadpolesEarnedForGame('stacker', 95)).toBe(23.75)
  })

  it('awards anagrams score as ceiling(score / (100 + duration * 10)) tadpoles', () => {
    expect(tadpolesEarnedForGame('anagrams', 0, { duration: 30, mode: 'classic' })).toBe(0)
    expect(tadpolesEarnedForGame('anagrams', 399, { duration: 30, mode: 'classic' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 400, { duration: 30, mode: 'classic' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 401, { duration: 30, mode: 'classic' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 1200, { duration: 30, mode: 'classic' })).toBe(3)

    expect(tadpolesEarnedForGame('anagrams', 699, { duration: 60, mode: 'classic' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 700, { duration: 60, mode: 'classic' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 701, { duration: 60, mode: 'classic' })).toBe(2)
  })

  it('halves anagrams tadpole rewards in reps mode', () => {
    expect(tadpolesEarnedForGame('anagrams', 401, { duration: 30, mode: 'reps' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 799, { duration: 30, mode: 'reps' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 800, { duration: 30, mode: 'reps' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 1200, { duration: 30, mode: 'reps' })).toBe(1)
    expect(tadpolesEarnedForGame('anagrams', 1600, { duration: 30, mode: 'reps' })).toBe(2)
  })
})
