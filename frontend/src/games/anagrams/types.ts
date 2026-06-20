export type AnagramsMode = 'classic' | 'reps' | 'shuffler'

export type AnagramsTimeLimit = 30 | 60 | 90

export type AnagramsStatus = 'idle' | 'playing' | 'gameover'

export interface AnagramsConfig {
  letterCount: number
  timeLimit: AnagramsTimeLimit
  mode: AnagramsMode
}

export interface FoundWord {
  word: string
  points: number
}

export interface AnagramsState {
  status: AnagramsStatus
  config: AnagramsConfig
  letters: string[]
  score: number
  foundWords: FoundWord[]
  usedWords: Set<string>
  timeRemainingMs: number
  shufflerValidCount: number
  lastMessage: string | null
  lastMessageType: 'success' | 'error' | null
}

export interface AnagramsSnapshot {
  status: AnagramsStatus
  config: AnagramsConfig
  letters: string[]
  score: number
  foundWords: FoundWord[]
  timeRemainingMs: number
  lastMessage: string | null
  lastMessageType: 'success' | 'error' | null
}

export type WordValidationError =
  | 'too_short'
  | 'not_in_dictionary'
  | 'invalid_letters'
  | 'already_used'

export type AnagramsAction =
  | { type: 'set_config'; config: Partial<AnagramsConfig> }
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'tick'; deltaMs: number }
  | { type: 'submit_word'; word: string; isValid: boolean; points?: number; error?: WordValidationError }
  | { type: 'clear_message' }
