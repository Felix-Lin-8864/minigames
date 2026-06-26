import { describe, expect, it } from 'vitest'
import { tadpolesEarnedForGame } from './tadpoleRewards'

describe('tadpolesEarnedForGame', () => {
  it('awards snake score divided by 2 as tadpoles', () => {
    expect(tadpolesEarnedForGame('snake', 0)).toBe(0)
    expect(tadpolesEarnedForGame('snake', 3)).toBe(1.5)
    expect(tadpolesEarnedForGame('snake', 4)).toBe(2)
    expect(tadpolesEarnedForGame('snake', 17)).toBe(8.5)
  })

  it('awards frogger score divided by 2 as tadpoles', () => {
    expect(tadpolesEarnedForGame('frogger', 42)).toBe(21)
  })

  it('awards stacker score divided by 4 as tadpoles', () => {
    expect(tadpolesEarnedForGame('stacker', 30)).toBe(7.5)
    expect(tadpolesEarnedForGame('stacker', 45)).toBe(11.25)
    expect(tadpolesEarnedForGame('stacker', 95)).toBe(23.75)
  })

  it('awards froggle score directly as tadpoles', () => {
    expect(tadpolesEarnedForGame('froggle', 0)).toBe(0)
    expect(tadpolesEarnedForGame('froggle', 11)).toBe(11)
    expect(tadpolesEarnedForGame('froggle', 19)).toBe(19)
  })

  it('awards anagrams score as 2 × ceiling(score / (duration * 10)) tadpoles', () => {
    expect(tadpolesEarnedForGame('anagrams', 0, { duration: 30, mode: 'classic' })).toBe(0)
    expect(tadpolesEarnedForGame('anagrams', 299, { duration: 30, mode: 'classic' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 300, { duration: 30, mode: 'classic' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 301, { duration: 30, mode: 'classic' })).toBe(4)
    expect(tadpolesEarnedForGame('anagrams', 1200, { duration: 30, mode: 'classic' })).toBe(8)

    expect(tadpolesEarnedForGame('anagrams', 599, { duration: 60, mode: 'classic' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 600, { duration: 60, mode: 'classic' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 601, { duration: 60, mode: 'classic' })).toBe(4)
  })

  it('awards anagrams reps as ceiling(score / (duration * 10)) tadpoles', () => {
    expect(tadpolesEarnedForGame('anagrams', 301, { duration: 30, mode: 'reps' })).toBe(2)
    expect(tadpolesEarnedForGame('anagrams', 601, { duration: 30, mode: 'reps' })).toBe(3)
    expect(tadpolesEarnedForGame('anagrams', 1200, { duration: 30, mode: 'reps' })).toBe(4)
    expect(tadpolesEarnedForGame('anagrams', 1600, { duration: 30, mode: 'reps' })).toBe(6)
  })
})
