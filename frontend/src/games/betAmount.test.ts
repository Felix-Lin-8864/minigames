import { describe, expect, it } from 'vitest'
import {
  formatOptionalBetAmount,
  roundToNearestMultiple,
  snapOptionalBetAmount,
  snapRequiredBetAmount,
} from './betAmount'

describe('roundToNearestMultiple', () => {
  it('rounds to the nearest step', () => {
    expect(roundToNearestMultiple(12, 5)).toBe(10)
    expect(roundToNearestMultiple(13, 5)).toBe(15)
    expect(roundToNearestMultiple(2, 5)).toBe(0)
  })
})

describe('snapRequiredBetAmount', () => {
  it('snaps to the nearest step and enforces the minimum', () => {
    expect(snapRequiredBetAmount('12', 10, 5)).toBe(10)
    expect(snapRequiredBetAmount('13', 10, 5)).toBe(15)
    expect(snapRequiredBetAmount('7', 10, 5)).toBe(10)
    expect(snapRequiredBetAmount('', 10, 5)).toBe(10)
    expect(snapRequiredBetAmount('abc', 10, 5)).toBe(10)
  })
})

describe('snapOptionalBetAmount', () => {
  it('returns zero for empty or sub-minimum rounded values', () => {
    expect(snapOptionalBetAmount('', 5, 5)).toBe(0)
    expect(snapOptionalBetAmount('0', 5, 5)).toBe(0)
    expect(snapOptionalBetAmount('2', 5, 5)).toBe(0)
    expect(snapOptionalBetAmount('3', 5, 5)).toBe(5)
    expect(snapOptionalBetAmount('12', 5, 5)).toBe(10)
  })
})

describe('formatOptionalBetAmount', () => {
  it('hides zero amounts', () => {
    expect(formatOptionalBetAmount(0)).toBe('')
    expect(formatOptionalBetAmount(5)).toBe('5')
  })
})
