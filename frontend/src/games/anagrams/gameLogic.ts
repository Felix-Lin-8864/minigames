import type { WordDictionary } from '../../dictionary/wordDictionary'
import { isWordInDictionary } from '../../dictionary/wordDictionary'
import {
  BASE_SCORE,
  DEFAULT_CONFIG,
  MIN_WORD_LENGTH,
  SHUFFLER_REGEN_EVERY,
} from './constants'
import { generateLetters as generateWeightedLetters } from './generateLetters'
import type {
  AnagramsAction,
  AnagramsConfig,
  AnagramsMode,
  AnagramsSnapshot,
  AnagramsState,
  WordValidationError,
} from './types'

export function generateLetters(letterCount: number, _mode: AnagramsMode): string[] {
  return generateWeightedLetters(letterCount)
}

export function scoreWord(wordLength: number): number {
  if (wordLength < MIN_WORD_LENGTH) return 0
  return BASE_SCORE * 2 ** (wordLength - MIN_WORD_LENGTH)
}

export function allowsLetterRepetition(mode: AnagramsMode): boolean {
  return mode === 'reps'
}

export function canFormWord(
  word: string,
  availableLetters: readonly string[],
  allowRepetition: boolean,
): boolean {
  const normalized = word.toLowerCase()

  if (allowRepetition) {
    const available = new Set(availableLetters.map((letter) => letter.toLowerCase()))
    return [...normalized].every((letter) => available.has(letter))
  }

  const pool = availableLetters.map((letter) => letter.toLowerCase())
  for (const letter of normalized) {
    const index = pool.indexOf(letter)
    if (index === -1) return false
    pool.splice(index, 1)
  }

  return true
}

export function validateWord(
  rawWord: string,
  letters: readonly string[],
  mode: AnagramsMode,
  usedWords: ReadonlySet<string>,
  dictionary: WordDictionary,
): { valid: true; word: string; points: number } | { valid: false; error: WordValidationError } {
  const word = rawWord.trim().toLowerCase()

  if (word.length < MIN_WORD_LENGTH) {
    return { valid: false, error: 'too_short' }
  }

  if (!isWordInDictionary(word, dictionary)) {
    return { valid: false, error: 'not_in_dictionary' }
  }

  if (!canFormWord(word, letters, allowsLetterRepetition(mode))) {
    return { valid: false, error: 'invalid_letters' }
  }

  if (usedWords.has(word)) {
    return { valid: false, error: 'already_used' }
  }

  return { valid: true, word, points: scoreWord(word.length) }
}

export function findAllValidWords(
  letters: readonly string[],
  mode: AnagramsMode,
  dictionary: WordDictionary,
): string[] {
  const allowRepetition = allowsLetterRepetition(mode)
  const maxLength = allowRepetition ? Number.POSITIVE_INFINITY : letters.length
  const validWords: string[] = []

  for (const word of dictionary) {
    if (word.length < MIN_WORD_LENGTH || word.length > maxLength) {
      continue
    }

    if (canFormWord(word, letters, allowRepetition)) {
      validWords.push(word)
    }
  }

  validWords.sort((left, right) => {
    if (left.length !== right.length) {
      return right.length - left.length
    }
    return left.localeCompare(right)
  })

  return validWords
}

export function createInitialState(): AnagramsState {
  return {
    status: 'idle',
    config: { ...DEFAULT_CONFIG },
    letters: [],
    score: 0,
    foundWords: [],
    usedWords: new Set(),
    timeRemainingMs: DEFAULT_CONFIG.timeLimit * 1000,
    shufflerValidCount: 0,
    lastMessage: null,
    lastMessageType: null,
  }
}

function startRound(state: AnagramsState): AnagramsState {
  const { config } = state
  return {
    ...state,
    status: 'playing',
    letters: generateLetters(config.letterCount, config.mode),
    score: 0,
    foundWords: [],
    usedWords: new Set(),
    timeRemainingMs: config.timeLimit * 1000,
    shufflerValidCount: 0,
    lastMessage: null,
    lastMessageType: null,
  }
}

export function anagramsReducer(state: AnagramsState, action: AnagramsAction): AnagramsState {
  switch (action.type) {
    case 'set_config': {
      if (state.status !== 'idle') return state
      const config: AnagramsConfig = { ...state.config, ...action.config }
      return {
        ...state,
        config,
        timeRemainingMs: config.timeLimit * 1000,
      }
    }

    case 'start':
      if (state.status !== 'idle') return state
      return startRound(state)

    case 'restart':
      return {
        ...state,
        status: 'idle',
        letters: [],
        score: 0,
        foundWords: [],
        usedWords: new Set(),
        timeRemainingMs: state.config.timeLimit * 1000,
        shufflerValidCount: 0,
        lastMessage: null,
        lastMessageType: null,
      }

    case 'tick': {
      if (state.status !== 'playing') return state
      const timeRemainingMs = Math.max(0, state.timeRemainingMs - action.deltaMs)
      if (timeRemainingMs === 0) {
        return { ...state, timeRemainingMs: 0, status: 'gameover' }
      }
      return { ...state, timeRemainingMs }
    }

    case 'clear_message':
      return { ...state, lastMessage: null, lastMessageType: null }

    case 'submit_word': {
      if (state.status !== 'playing') return state

      if (!action.isValid || action.error) {
        return {
          ...state,
          lastMessage: action.error ?? 'invalid_letters',
          lastMessageType: 'error',
        }
      }

      const word = action.word.trim().toLowerCase()
      const points = action.points ?? scoreWord(word.length)
      const usedWords = new Set(state.usedWords)
      usedWords.add(word)

      let nextState: AnagramsState = {
        ...state,
        score: state.score + points,
        foundWords: [...state.foundWords, { word, points }],
        usedWords,
        lastMessage: `+${points} for "${word}"`,
        lastMessageType: 'success',
      }

      if (state.config.mode === 'shuffler') {
        const shufflerValidCount = state.shufflerValidCount + 1
        nextState = { ...nextState, shufflerValidCount }

        if (shufflerValidCount >= SHUFFLER_REGEN_EVERY) {
          nextState = {
            ...nextState,
            letters: generateLetters(state.config.letterCount, state.config.mode),
            usedWords: new Set(),
            shufflerValidCount: 0,
            lastMessage: `+${points} for "${word}" — new letters!`,
            lastMessageType: 'success',
          }
        }
      }

      return nextState
    }

    default:
      return state
  }
}

export function toSnapshot(state: AnagramsState): AnagramsSnapshot {
  return {
    status: state.status,
    config: state.config,
    letters: state.letters,
    score: state.score,
    foundWords: state.foundWords,
    timeRemainingMs: state.timeRemainingMs,
    lastMessage: state.lastMessage,
    lastMessageType: state.lastMessageType,
  }
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`
}
