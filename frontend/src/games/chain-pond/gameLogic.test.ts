import { describe, expect, it, vi } from 'vitest'
import {
  advanceTurn,
  calculateFinalTadpoles,
  chainPondReducer,
  createIdleState,
  createInitialState,
  createTurnState,
  hasValidWord,
  partitionChainPondWords,
  resolveFeasibleTurn,
  validateSubmission,
} from './gameLogic'
import type { ChainPondState } from './types'

function makeWordsByLength(entries: Record<number, string[]>): Record<number, Set<string>> {
  const result: Record<number, Set<string>> = {}
  for (const [length, words] of Object.entries(entries)) {
    result[Number(length)] = new Set(words.map((w) => w.toUpperCase()))
  }
  return result
}

const SAMPLE_WORDS = makeWordsByLength({
  4: ['ABLE', 'ECHO', 'OPEN', 'NEAT'],
  5: ['TABLE', 'EAGLE', 'NORTH'],
  6: ['TANGLE', 'EAGLES'],
})

describe('hasValidWord', () => {
  it('returns true when a matching unused word exists', () => {
    expect(hasValidWord(SAMPLE_WORDS, 'T', 5, new Set())).toBe(true)
  })

  it('returns false when all matching words are used', () => {
    expect(hasValidWord(SAMPLE_WORDS, 'T', 5, new Set(['TABLE']))).toBe(false)
  })
})

describe('drawRequiredLength', () => {
  it('never returns a length without a feasible word for the resolved letter', () => {
    const usedWords = new Set<string>()
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    for (let i = 0; i < 50; i++) {
      const turn = resolveFeasibleTurn('T', SAMPLE_WORDS, usedWords)
      expect(
        hasValidWord(SAMPLE_WORDS, turn.startLetter, turn.requiredLength, usedWords),
      ).toBe(true)
    }

    random.mockRestore()
  })

  it('advances the starting letter when no length is feasible', () => {
    const sparse = makeWordsByLength({ 4: ['NEAT'] })
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    const turn = resolveFeasibleTurn('Z', sparse, new Set())
    expect(turn.startLetter).toBe('N')
    expect(hasValidWord(sparse, turn.startLetter, turn.requiredLength, new Set())).toBe(true)

    random.mockRestore()
  })
})

describe('validateSubmission', () => {
  const turn: TurnState = { startLetter: 'T', requiredLength: 5, timeRemaining: 15 }
  const usedWords = new Set(['ECHO'])

  it('returns wrong_letter for incorrect starting letter', () => {
    expect(validateSubmission('EAGLE', turn, usedWords, SAMPLE_WORDS)).toEqual({
      outcome: 'invalid',
      reason: 'wrong_letter',
    })
  })

  it('returns wrong_length for incorrect length', () => {
    expect(validateSubmission('TABLET', turn, usedWords, SAMPLE_WORDS)).toEqual({
      outcome: 'invalid',
      reason: 'wrong_length',
    })
  })

  it('returns not_in_dictionary for unknown words', () => {
    expect(validateSubmission('TZZZZ', turn, usedWords, SAMPLE_WORDS)).toEqual({
      outcome: 'invalid',
      reason: 'not_in_dictionary',
    })
  })

  it('returns chain_end for already used words', () => {
    expect(validateSubmission('ECHO', turn, usedWords, SAMPLE_WORDS)).toEqual({
      outcome: 'chain_end',
      reason: 'already_used',
    })
  })

  it('returns valid for a word satisfying all constraints', () => {
    expect(validateSubmission('table', turn, usedWords, SAMPLE_WORDS)).toEqual({
      outcome: 'valid',
    })
  })
})

describe('calculateFinalTadpoles', () => {
  it('equals score, floored at zero', () => {
    expect(calculateFinalTadpoles(5)).toBe(5)
    expect(calculateFinalTadpoles(-2)).toBe(0)
    expect(calculateFinalTadpoles(9)).toBe(9)
    expect(calculateFinalTadpoles(10)).toBe(10)
  })
})

describe('advanceTurn', () => {
  it('extends the chain and draws a feasible next turn', () => {
    const state: ChainPondState = {
      ...createInitialState(SAMPLE_WORDS, () => 0),
      currentTurn: createTurnState('T', SAMPLE_WORDS, new Set(), () => 0),
    }

    const next = advanceTurn(state, 'TABLE', SAMPLE_WORDS, () => 0)

    expect(next.chain).toEqual(['TABLE'])
    expect(next.usedWords.has('TABLE')).toBe(true)
    expect(next.validWords).toBe(1)
    expect(next.score).toBe(1)
    expect(next.currentTurn.startLetter).toBe('E')
    expect(
      hasValidWord(SAMPLE_WORDS, next.currentTurn.startLetter, next.currentTurn.requiredLength, next.usedWords),
    ).toBe(true)
  })
})

describe('partitionChainPondWords', () => {
  it('keeps only lengths 4 through 11', () => {
    const partitioned = partitionChainPondWords(['cat', 'frog', 'pond', 'a'.repeat(12)])

    expect(partitioned[3]).toBeUndefined()
    expect(partitioned[4]?.has('FROG')).toBe(true)
    expect(partitioned[4]?.has('POND')).toBe(true)
    expect(partitioned[12]).toBeUndefined()
  })
})

describe('invalid submission scoring', () => {
  it('decrements score by 1 for each invalid reason', () => {
    const wordsByLength = SAMPLE_WORDS
    let state = {
      ...createIdleState(),
      ...createInitialState(wordsByLength),
      score: 3,
      validWords: 3,
      currentTurn: { startLetter: 'T', requiredLength: 5 as const, timeRemaining: 15 },
    }

    for (const word of ['EAGLE', 'TABLET', 'TZZZZ']) {
      state = chainPondReducer(state, { type: 'submit', word, wordsByLength })
      expect(state.status).toBe('playing')
    }

    expect(state.score).toBe(0)
  })
})
