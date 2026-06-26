import { describe, expect, it } from 'vitest'
import { MIN_WORD_LENGTH } from './constants'
import { getSlotCount, normalizeWordInput } from './WordSlotInput'

describe('normalizeWordInput', () => {
  it('lowercases and strips non-letters', () => {
    expect(normalizeWordInput('HeLLo123!')).toBe('hello')
  })
})

describe('getSlotCount', () => {
  it('shows at least MIN_WORD_LENGTH slots when empty', () => {
    expect(getSlotCount(0, MIN_WORD_LENGTH, 9)).toBe(MIN_WORD_LENGTH)
  })

  it('adds one trailing slot while typing', () => {
    expect(getSlotCount(2, MIN_WORD_LENGTH, 9)).toBe(3)
    expect(getSlotCount(4, MIN_WORD_LENGTH, 9)).toBe(5)
  })

  it('stops growing at max length', () => {
    expect(getSlotCount(9, MIN_WORD_LENGTH, 9)).toBe(9)
  })
})
