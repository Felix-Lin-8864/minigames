import { describe, expect, it } from 'vitest'
import {
  GRID,
  VALID_CORNERS,
  VALID_SIX_LINES,
  VALID_SPLITS,
  VALID_STREETS,
  isAdjacentPair,
} from './grid'
import { isValidAdjacency } from './bets'

describe('GRID layout', () => {
  it('has bottom row 1-2-3 and top row 34-35-36', () => {
    expect(GRID[0]).toEqual([1, 2, 3])
    expect(GRID[11]).toEqual([34, 35, 36])
  })
})

describe('adjacency sets', () => {
  it('includes 0 splits', () => {
    expect(VALID_SPLITS.has('0-1')).toBe(true)
    expect(VALID_SPLITS.has('0-2')).toBe(true)
    expect(VALID_SPLITS.has('0-3')).toBe(true)
  })

  it('includes horizontal and vertical splits', () => {
    expect(VALID_SPLITS.has('1-2')).toBe(true)
    expect(VALID_SPLITS.has('1-4')).toBe(true)
    expect(VALID_SPLITS.has('35-36')).toBe(true)
  })

  it('includes valid streets', () => {
    expect(VALID_STREETS.has('1-2-3')).toBe(true)
    expect(VALID_STREETS.has('34-35-36')).toBe(true)
  })

  it('includes valid corners', () => {
    expect(VALID_CORNERS.has('1-2-4-5')).toBe(true)
    expect(VALID_CORNERS.has('32-33-35-36')).toBe(true)
  })

  it('includes valid six-lines', () => {
    expect(VALID_SIX_LINES.has('1-2-3-4-5-6')).toBe(true)
    expect(VALID_SIX_LINES.has('31-32-33-34-35-36')).toBe(true)
  })
})

describe('isValidAdjacency rejections', () => {
  it('rejects non-adjacent split', () => {
    expect(isValidAdjacency('split', [1, 3])).toBe(false)
  })

  it('rejects invalid corner', () => {
    expect(isValidAdjacency('corner', [1, 2, 3, 4])).toBe(false)
  })

  it('rejects non-adjacent six-line', () => {
    expect(isValidAdjacency('sixline', [1, 2, 3, 7, 8, 9])).toBe(false)
  })
})

describe('isAdjacentPair', () => {
  it('returns true for valid pairs', () => {
    expect(isAdjacentPair(1, 2)).toBe(true)
    expect(isAdjacentPair(0, 3)).toBe(true)
  })

  it('returns false for invalid pairs', () => {
    expect(isAdjacentPair(1, 3)).toBe(false)
  })
})
