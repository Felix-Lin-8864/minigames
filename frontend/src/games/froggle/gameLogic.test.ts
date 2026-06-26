import { describe, expect, it, vi } from 'vitest'
import {
  calculateScore,
  createInitialState,
  evaluateGuess,
  froggleReducer,
  maxGuessesForLength,
  selectTargetWord,
  updateKeyboardState,
} from './gameLogic'

describe('evaluateGuess', () => {
  it('marks SPEED vs SPELL with duplicate-letter handling', () => {
    // First two letters match; the E at index 2 is green; the second E is grey
    // because SPELL only contains one E, already claimed at the correct position.
    expect(evaluateGuess('SPEED', 'SPELL')).toEqual([
      'green',
      'green',
      'green',
      'grey',
      'grey',
    ])
  })

  it('marks only one yellow when guess has more copies than target', () => {
    expect(evaluateGuess('AABBB', 'AAABB')).toEqual([
      'green',
      'green',
      'grey',
      'green',
      'green',
    ])
  })

  it('does not mark yellow when target letter is fully consumed by greens', () => {
    expect(evaluateGuess('EEEE', 'EACH')).toEqual(['green', 'grey', 'grey', 'grey'])
  })

  it('handles all-green match', () => {
    expect(evaluateGuess('CRANE', 'CRANE')).toEqual([
      'green',
      'green',
      'green',
      'green',
      'green',
    ])
  })

  it('handles yellow for present but misplaced letters', () => {
    expect(evaluateGuess('CRANE', 'REACT')).toEqual([
      'yellow',
      'yellow',
      'green',
      'grey',
      'yellow',
    ])
  })
})

describe('updateKeyboardState', () => {
  it('never downgrades green to yellow or grey', () => {
    const next = updateKeyboardState({ A: 'green' }, 'ABCDE', [
      'yellow',
      'grey',
      'grey',
      'grey',
      'grey',
    ])
    expect(next.A).toBe('green')
  })

  it('never downgrades yellow to grey', () => {
    const next = updateKeyboardState({ B: 'yellow' }, 'ABCDE', [
      'grey',
      'grey',
      'grey',
      'grey',
      'grey',
    ])
    expect(next.B).toBe('yellow')
  })

  it('upgrades grey to yellow and yellow to green', () => {
    let state: Record<string, 'green' | 'yellow' | 'grey'> = {}
    state = updateKeyboardState(state, 'CRANE', ['grey', 'grey', 'grey', 'grey', 'grey'])
    expect(state.R).toBe('grey')

    state = updateKeyboardState(state, 'ROAST', ['yellow', 'grey', 'grey', 'grey', 'grey'])
    expect(state.R).toBe('yellow')

    state = updateKeyboardState(state, 'RADIO', ['green', 'grey', 'grey', 'grey', 'grey'])
    expect(state.R).toBe('green')
  })
})

describe('maxGuessesForLength', () => {
  it('allows one more guess than the word length', () => {
    expect(maxGuessesForLength(5)).toBe(6)
    expect(maxGuessesForLength(8)).toBe(9)
  })
})

describe('calculateScore', () => {
  it('awards ceil(length² / 4) plus ceil((length / 2) × guesses remaining) on a win', () => {
    expect(calculateScore(5, 5, true)).toBe(20)
    expect(calculateScore(5, 0, true)).toBe(7)
    expect(calculateScore(8, 8, true)).toBe(48)
    expect(calculateScore(8, 0, true)).toBe(16)
  })

  it('returns zero on a loss', () => {
    expect(calculateScore(5, 3, false)).toBe(0)
    expect(calculateScore(8, 0, false)).toBe(0)
  })
})

describe('selectTargetWord', () => {
  it('returns a word from the list using the provided random source', () => {
    const random = vi.fn().mockReturnValue(0.5)
    const list = ['ALPHA', 'BETA', 'GAMMA']

    expect(selectTargetWord(list, random)).toBe('BETA')
    expect(random).toHaveBeenCalled()
  })

  it('never returns undefined for a non-empty list', () => {
    const word = selectTargetWord(['HELLO'])
    expect(word).toBe('HELLO')
  })
})

describe('froggleReducer', () => {
  const wordList = ['CRANE', 'SLATE', 'SPEED', 'SPELL']

  it('rejects invalid guesses without consuming guesses remaining', () => {
    const initial = createInitialState(5, wordList, () => 0)
    const next = froggleReducer(
      { ...initial, currentGuess: 'ZZZZZ' },
      { type: 'submit_guess' },
    )

    expect(next.invalidMessage).toBe('Not in word list')
    expect(next.guessesRemaining).toBe(6)
    expect(next.guesses).toHaveLength(0)
  })

  it('consumes a guess for valid submissions', () => {
    const initial = createInitialState(5, wordList, () => 0)
    const next = froggleReducer(
      { ...initial, currentGuess: 'CRANE' },
      { type: 'submit_guess' },
    )

    expect(next.guessesRemaining).toBe(5)
    expect(next.guesses).toEqual(['CRANE'])
  })

  it('forfeits the round, reveals the answer, and awards zero score', () => {
    const initial = createInitialState(5, wordList, () => 0)
    const next = froggleReducer(initial, { type: 'forfeit' })

    expect(next.status).toBe('lost')
    expect(next.score).toBe(0)
    expect(next.guessesRemaining).toBe(0)
    expect(next.forfeited).toBe(true)
    expect(next.config.targetWord).toBe(initial.config.targetWord)
  })
})
