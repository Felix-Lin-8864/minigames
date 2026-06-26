export type LetterResult = 'green' | 'yellow' | 'grey'

export type WordLength = 5 | 6 | 7 | 8

export type FroggleStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface FroggleConfig {
  wordLength: WordLength
  wordList: string[]
  targetWord: string
  maxGuesses: number
}

export interface FroggleState {
  guesses: string[]
  results: LetterResult[][]
  keyboardState: Record<string, LetterResult>
  guessesRemaining: number
  status: FroggleStatus
  config: FroggleConfig
  currentGuess: string
  invalidMessage: string | null
  score: number
  forfeited: boolean
}

export interface FroggleSnapshot {
  guesses: string[]
  results: LetterResult[][]
  keyboardState: Record<string, LetterResult>
  guessesRemaining: number
  status: FroggleStatus
  wordLength: WordLength
  targetWord: string
  maxGuesses: number
  currentGuess: string
  invalidMessage: string | null
  score: number
  forfeited: boolean
}

export interface FroggleWordLists {
  words5: string[]
  words6: string[]
  words7: string[]
  words8: string[]
}
