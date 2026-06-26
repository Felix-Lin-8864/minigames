import type {
  FroggleConfig,
  FroggleSnapshot,
  FroggleState,
  FroggleStatus,
  LetterResult,
  WordLength,
} from './types'

const RESULT_PRIORITY: Record<LetterResult, number> = {
  grey: 0,
  yellow: 1,
  green: 2,
}

export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const length = guess.length
  const results: LetterResult[] = Array.from({ length }, () => 'grey')
  const remainingCounts = new Map<string, number>()

  for (let i = 0; i < length; i++) {
    if (guess[i] === target[i]) {
      results[i] = 'green'
    }
  }

  for (let i = 0; i < length; i++) {
    if (results[i] === 'green') continue
    const letter = target[i]!
    remainingCounts.set(letter, (remainingCounts.get(letter) ?? 0) + 1)
  }

  for (let i = 0; i < length; i++) {
    if (results[i] === 'green') continue
    const letter = guess[i]!
    const remaining = remainingCounts.get(letter) ?? 0
    if (remaining > 0) {
      results[i] = 'yellow'
      remainingCounts.set(letter, remaining - 1)
    }
  }

  return results
}

export function updateKeyboardState(
  current: Record<string, LetterResult>,
  guess: string,
  results: LetterResult[],
): Record<string, LetterResult> {
  const next = { ...current }

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]!
    const result = results[i]!
    const existing = next[letter]

    if (!existing || RESULT_PRIORITY[result] > RESULT_PRIORITY[existing]) {
      next[letter] = result
    }
  }

  return next
}

export function maxGuessesForLength(wordLength: WordLength): number {
  return wordLength + 1
}

export function calculateScore(
  wordLength: WordLength,
  guessesRemaining: number,
  won: boolean,
): number {
  if (!won) return 0
  return (
    Math.ceil((wordLength * wordLength) / 4) +
    Math.ceil((wordLength / 2) * guessesRemaining)
  )
}

export function selectTargetWord(wordList: string[], random: () => number = Math.random): string {
  if (wordList.length === 0) {
    throw new Error('Cannot select target word from an empty list')
  }
  const index = Math.floor(random() * wordList.length)
  return wordList[index]!
}

export function createConfig(
  wordLength: WordLength,
  wordList: string[],
  random: () => number = Math.random,
): FroggleConfig {
  return {
    wordLength,
    wordList,
    targetWord: selectTargetWord(wordList, random),
    maxGuesses: maxGuessesForLength(wordLength),
  }
}

export function createInitialState(
  wordLength: WordLength,
  wordList: string[],
  random: () => number = Math.random,
): FroggleState {
  const config = createConfig(wordLength, wordList, random)

  return {
    guesses: [],
    results: [],
    keyboardState: {},
    guessesRemaining: config.maxGuesses,
    status: 'playing',
    config,
    currentGuess: '',
    invalidMessage: null,
    score: 0,
    forfeited: false,
  }
}

export function toSnapshot(state: FroggleState): FroggleSnapshot {
  return {
    guesses: state.guesses,
    results: state.results,
    keyboardState: state.keyboardState,
    guessesRemaining: state.guessesRemaining,
    status: state.status,
    wordLength: state.config.wordLength,
    targetWord: state.config.targetWord,
    maxGuesses: state.config.maxGuesses,
    currentGuess: state.currentGuess,
    invalidMessage: state.invalidMessage,
    score: state.score,
    forfeited: state.forfeited,
  }
}

export function isValidGuess(guess: string, wordList: string[]): boolean {
  return wordList.includes(guess.toUpperCase())
}

export type FroggleAction =
  | { type: 'start'; wordLength: WordLength; wordList: string[]; random?: () => number }
  | { type: 'set_word_length'; wordLength: WordLength; wordList: string[] }
  | { type: 'play_again'; wordList: string[]; random?: () => number }
  | { type: 'type_letter'; letter: string }
  | { type: 'backspace' }
  | { type: 'submit_guess' }
  | { type: 'forfeit' }
  | { type: 'clear_invalid_message' }

function normalizeLetter(letter: string): string {
  return letter.toUpperCase()
}

export function froggleReducer(state: FroggleState, action: FroggleAction): FroggleState {
  switch (action.type) {
    case 'start':
      return createInitialState(action.wordLength, action.wordList, action.random)

    case 'set_word_length': {
      if (state.status === 'playing') return state
      return {
        ...state,
        config: {
          ...state.config,
          wordLength: action.wordLength,
          wordList: action.wordList,
          maxGuesses: maxGuessesForLength(action.wordLength),
        },
      }
    }

    case 'play_again': {
      const wordLength = state.config.wordLength
      return createInitialState(wordLength, action.wordList, action.random)
    }

    case 'type_letter': {
      if (state.status !== 'playing') return state
      const letter = normalizeLetter(action.letter)
      if (!/^[A-Z]$/.test(letter)) return state
      if (state.currentGuess.length >= state.config.wordLength) return state
      return {
        ...state,
        currentGuess: state.currentGuess + letter,
        invalidMessage: null,
      }
    }

    case 'backspace': {
      if (state.status !== 'playing' || state.currentGuess.length === 0) return state
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        invalidMessage: null,
      }
    }

    case 'clear_invalid_message':
      return { ...state, invalidMessage: null }

    case 'forfeit': {
      if (state.status !== 'playing') return state
      return {
        ...state,
        status: 'lost',
        currentGuess: '',
        invalidMessage: null,
        guessesRemaining: 0,
        score: 0,
        forfeited: true,
      }
    }

    case 'submit_guess': {
      if (state.status !== 'playing') return state
      if (state.currentGuess.length !== state.config.wordLength) return state

      const guess = state.currentGuess.toUpperCase()
      if (!isValidGuess(guess, state.config.wordList)) {
        return {
          ...state,
          invalidMessage: 'Not in word list',
        }
      }

      const tileResults = evaluateGuess(guess, state.config.targetWord)
      const guessesRemaining = state.guessesRemaining - 1
      const won = guess === state.config.targetWord
      const lost = !won && guessesRemaining === 0
      const status: FroggleStatus = won ? 'won' : lost ? 'lost' : 'playing'
      const score = calculateScore(state.config.wordLength, guessesRemaining, won)

      return {
        ...state,
        guesses: [...state.guesses, guess],
        results: [...state.results, tileResults],
        keyboardState: updateKeyboardState(state.keyboardState, guess, tileResults),
        guessesRemaining,
        status,
        currentGuess: '',
        invalidMessage: null,
        score,
        forfeited: false,
      }
    }

    default:
      return state
  }
}
