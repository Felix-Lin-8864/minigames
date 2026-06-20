import { describe, expect, it } from 'vitest'
import {
  countRareLetters,
  countVowels,
  generateLetters,
  generateUniformLetters,
  MAX_RARE_LETTERS,
  MIN_VOWELS,
} from './generateLetters'

const TRIAL_COUNT = 5_000
const LETTER_COUNT = 6

function averageVowels(sample: (count: number) => string[]): number {
  let total = 0
  for (let i = 0; i < TRIAL_COUNT; i++) {
    total += countVowels(sample(LETTER_COUNT))
  }
  return total / TRIAL_COUNT
}

describe('generateLetters', () => {
  it('always returns exactly count letters', () => {
    for (let count = 6; count <= 9; count++) {
      for (let trial = 0; trial < 200; trial++) {
        expect(generateLetters(count)).toHaveLength(count)
      }
    }
  })

  it('samples without replacement', () => {
    for (let trial = 0; trial < TRIAL_COUNT; trial++) {
      const letters = generateLetters(LETTER_COUNT)
      expect(new Set(letters).size).toBe(letters.length)
    }
  })

  it('always includes at least two vowels', () => {
    for (let trial = 0; trial < TRIAL_COUNT; trial++) {
      expect(countVowels(generateLetters(LETTER_COUNT))).toBeGreaterThanOrEqual(MIN_VOWELS)
    }
  })

  it('never includes more than one rare letter', () => {
    for (let trial = 0; trial < TRIAL_COUNT; trial++) {
      expect(countRareLetters(generateLetters(LETTER_COUNT))).toBeLessThanOrEqual(MAX_RARE_LETTERS)
    }
  })

  it('produces measurably more vowels than uniform sampling', () => {
    const weightedAverage = averageVowels((count) => generateLetters(count))
    const uniformAverage = averageVowels((count) => generateUniformLetters(count))

    expect(weightedAverage).toBeGreaterThan(uniformAverage)
    expect(weightedAverage).toBeGreaterThanOrEqual(MIN_VOWELS)
    expect(uniformAverage).toBeLessThan(MIN_VOWELS)
  })

  it('rejects counts outside the supported range', () => {
    expect(() => generateLetters(1)).toThrow(RangeError)
    expect(() => generateLetters(27)).toThrow(RangeError)
  })
})
