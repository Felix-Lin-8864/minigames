import { describe, expect, it } from 'vitest'
import { canFormWord, findAllValidWords } from './gameLogic'

const dictionary = new Set([
  'act',
  'cat',
  'at',
  'tea',
  'eat',
  'ate',
  'tee',
  'teepee',
  'aa',
  'a',
])

describe('findAllValidWords', () => {
  it('returns words formable from letters, sorted by length then lexicographically', () => {
    const words = findAllValidWords(['c', 'a', 't'], 'classic', dictionary)

    expect(words).toEqual(['act', 'cat'])
  })

  it('includes longer words in reps mode when letters can repeat', () => {
    const words = findAllValidWords(['t', 'e', 'a'], 'reps', dictionary)

    expect(words).toEqual(['ate', 'eat', 'tea', 'tee'])
  })

  it('excludes words that cannot be formed without repetition in classic mode', () => {
    const words = findAllValidWords(['t', 'e', 'a'], 'classic', dictionary)

    expect(words).not.toContain('tee')
    expect(words).not.toContain('teepee')
  })
})

describe('canFormWord', () => {
  it('respects letter repetition rules', () => {
    expect(canFormWord('tee', ['t', 'e', 'a'], false)).toBe(false)
    expect(canFormWord('tee', ['t', 'e', 'a'], true)).toBe(true)
  })
})
