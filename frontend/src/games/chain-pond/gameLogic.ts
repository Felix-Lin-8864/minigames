import { LETTER_WEIGHTS, RARE_LETTERS, type Letter } from '../anagrams/generateLetters'
import {
  MAX_WORD_LENGTH,
  MIN_WORD_LENGTH,
  MAX_LENGTH_REROLLS,
  TURN_TIMER_SECONDS,
  VALID_WORD_LENGTHS,
} from './constants'
import type {
  ChainPondSnapshot,
  ChainPondState,
  EndReason,
  SubmissionResult,
  TurnState,
  WordLength,
} from './types'

export type WordsByLength = Record<number, Set<string>>

const OPENING_LETTERS = (Object.keys(LETTER_WEIGHTS) as Letter[]).filter(
  (letter) => !RARE_LETTERS.includes(letter),
)

function normalizeWord(word: string): string {
  return word.trim().toUpperCase()
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function weightedPickLetter(
  candidates: readonly Letter[],
  random: () => number,
): string {
  const totalWeight = candidates.reduce((sum, letter) => sum + LETTER_WEIGHTS[letter], 0)
  let roll = random() * totalWeight

  for (const letter of candidates) {
    roll -= LETTER_WEIGHTS[letter]
    if (roll <= 0) return letter.toUpperCase()
  }

  return candidates[candidates.length - 1]!.toUpperCase()
}

export function drawOpeningLetter(random: () => number = Math.random): string {
  return weightedPickLetter(OPENING_LETTERS, random)
}

export function advanceStartingLetter(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0)
  if (code < 65 || code > 90) return 'A'
  return String.fromCharCode(code === 90 ? 65 : code + 1)
}

export function hasValidWord(
  wordsByLength: WordsByLength,
  startLetter: string,
  requiredLength: number,
  usedWords: Set<string>,
): boolean {
  const candidates = wordsByLength[requiredLength]
  if (!candidates) return false

  const letter = startLetter.toUpperCase()
  for (const word of candidates) {
    if (word[0] === letter && !usedWords.has(word)) {
      return true
    }
  }

  return false
}

function randomWordLength(random: () => number): WordLength {
  return randomInt(MIN_WORD_LENGTH, MAX_WORD_LENGTH, random) as WordLength
}

export function resolveFeasibleTurn(
  startLetter: string,
  wordsByLength: WordsByLength,
  usedWords: Set<string>,
  random: () => number = Math.random,
): { startLetter: string; requiredLength: WordLength } {
  let letter = startLetter.toUpperCase()

  for (let letterAttempts = 0; letterAttempts < 26; letterAttempts++) {
    for (let attempt = 0; attempt < MAX_LENGTH_REROLLS; attempt++) {
      const length = randomWordLength(random)
      if (hasValidWord(wordsByLength, letter, length, usedWords)) {
        return { startLetter: letter, requiredLength: length }
      }
    }

    letter = advanceStartingLetter(letter)
  }

  throw new Error('No feasible word length found for chain pond turn')
}

export function drawRequiredLength(
  startLetter: string,
  wordsByLength: WordsByLength,
  usedWords: Set<string>,
  random: () => number = Math.random,
): WordLength {
  return resolveFeasibleTurn(startLetter, wordsByLength, usedWords, random).requiredLength
}

export function createTurnState(
  startLetter: string,
  wordsByLength: WordsByLength,
  usedWords: Set<string>,
  random: () => number = Math.random,
): TurnState {
  const feasible = resolveFeasibleTurn(startLetter, wordsByLength, usedWords, random)

  return {
    startLetter: feasible.startLetter,
    requiredLength: feasible.requiredLength,
    timeRemaining: TURN_TIMER_SECONDS,
  }
}

export function validateSubmission(
  word: string,
  turn: TurnState,
  usedWords: Set<string>,
  wordsByLength: WordsByLength,
): SubmissionResult {
  const normalized = normalizeWord(word)

  if (!normalized) {
    return { outcome: 'invalid', reason: 'not_in_dictionary' }
  }

  if (usedWords.has(normalized)) {
    return { outcome: 'chain_end', reason: 'already_used' }
  }

  if (normalized[0] !== turn.startLetter.toUpperCase()) {
    return { outcome: 'invalid', reason: 'wrong_letter' }
  }

  if (normalized.length !== turn.requiredLength) {
    return { outcome: 'invalid', reason: 'wrong_length' }
  }

  const candidates = wordsByLength[turn.requiredLength]
  if (!candidates?.has(normalized)) {
    return { outcome: 'invalid', reason: 'not_in_dictionary' }
  }

  return { outcome: 'valid' }
}

export function calculateFinalTadpoles(score: number): number {
  return Math.max(0, score)
}

export function advanceTurn(
  state: ChainPondState,
  submittedWord: string,
  wordsByLength: WordsByLength,
  random: () => number = Math.random,
): ChainPondState {
  const normalized = normalizeWord(submittedWord)
  const nextUsedWords = new Set(state.usedWords)
  nextUsedWords.add(normalized)

  const nextStartLetter = normalized[normalized.length - 1]!

  return {
    ...state,
    chain: [...state.chain, normalized],
    usedWords: nextUsedWords,
    validWords: state.validWords + 1,
    score: state.score + 1,
    currentTurn: createTurnState(nextStartLetter, wordsByLength, nextUsedWords, random),
    status: 'playing',
    endReason: null,
  }
}

export function createInitialState(
  wordsByLength: WordsByLength,
  random: () => number = Math.random,
): ChainPondState {
  const startLetter = drawOpeningLetter(random)

  return {
    chain: [],
    usedWords: new Set(),
    currentTurn: createTurnState(startLetter, wordsByLength, new Set(), random),
    score: 0,
    validWords: 0,
    status: 'playing',
    endReason: null,
  }
}

export function endChain(state: ChainPondState, reason: EndReason): ChainPondState {
  return {
    ...state,
    status: 'ended',
    endReason: reason,
  }
}

export function tickTimer(state: ChainPondState, deltaSeconds: number): ChainPondState {
  if (state.status !== 'playing') return state

  const timeRemaining = Math.max(0, state.currentTurn.timeRemaining - deltaSeconds)
  if (timeRemaining === 0) {
    return endChain(
      {
        ...state,
        currentTurn: { ...state.currentTurn, timeRemaining: 0 },
      },
      'timeout',
    )
  }

  return {
    ...state,
    currentTurn: { ...state.currentTurn, timeRemaining },
  }
}

export function toSnapshot(state: ChainPondState): ChainPondSnapshot {
  return {
    chain: state.chain,
    currentTurn: state.currentTurn,
    score: state.score,
    validWords: state.validWords,
    status: state.status,
    endReason: state.endReason,
    finalTadpoles: calculateFinalTadpoles(state.score),
  }
}

export function partitionChainPondWords(dictionary: Iterable<string>): WordsByLength {
  const result: WordsByLength = {}

  for (const length of VALID_WORD_LENGTHS) {
    result[length] = new Set()
  }

  for (const word of dictionary) {
    const upper = word.toUpperCase()
    const len = upper.length
    if (len >= MIN_WORD_LENGTH && len <= MAX_WORD_LENGTH) {
      result[len]?.add(upper)
    }
  }

  return result
}

export type ChainPondAction =
  | { type: 'start'; wordsByLength: WordsByLength; random?: () => number }
  | { type: 'play_again'; wordsByLength: WordsByLength; random?: () => number }
  | { type: 'submit'; word: string; wordsByLength: WordsByLength; random?: () => number }
  | { type: 'tick'; deltaSeconds: number }
  | { type: 'clear_invalid_message' }

export interface ChainPondReducerState extends ChainPondState {
  invalidMessage: string | null
}

export function createIdleState(): ChainPondReducerState {
  return {
    chain: [],
    usedWords: new Set(),
    currentTurn: {
      startLetter: 'A',
      requiredLength: MIN_WORD_LENGTH,
      timeRemaining: TURN_TIMER_SECONDS,
    },
    score: 0,
    validWords: 0,
    status: 'idle',
    endReason: null,
    invalidMessage: null,
  }
}

export function chainPondReducer(
  state: ChainPondReducerState,
  action: ChainPondAction,
): ChainPondReducerState {
  switch (action.type) {
    case 'start':
    case 'play_again': {
      const next = createInitialState(action.wordsByLength, action.random)
      return {
        ...next,
        invalidMessage: null,
      }
    }

    case 'submit': {
      if (state.status !== 'playing') return state

      const result = validateSubmission(
        action.word,
        state.currentTurn,
        state.usedWords,
        action.wordsByLength,
      )

      if (result.outcome === 'chain_end') {
        return {
          ...endChain(state, result.reason),
          invalidMessage: 'Word already used in this chain',
        }
      }

      if (result.outcome === 'invalid') {
        const messages = {
          wrong_letter: 'Wrong starting letter',
          wrong_length: `Must be ${state.currentTurn.requiredLength} letters`,
          not_in_dictionary: 'Not in word list',
        } as const

        return {
          ...state,
          invalidMessage: messages[result.reason],
        }
      }

      const advanced = advanceTurn(state, action.word, action.wordsByLength, action.random)
      return {
        ...advanced,
        invalidMessage: null,
      }
    }

    case 'tick': {
      const next = tickTimer(state, action.deltaSeconds)
      if (next === state) return state
      return { ...state, ...next }
    }

    case 'clear_invalid_message':
      return { ...state, invalidMessage: null }

    default:
      return state
  }
}
