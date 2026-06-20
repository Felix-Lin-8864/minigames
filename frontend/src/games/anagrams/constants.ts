import type { AnagramsConfig, AnagramsMode, AnagramsTimeLimit } from './types'

export const MIN_LETTER_COUNT = 6
export const MAX_LETTER_COUNT = 9
export const MIN_WORD_LENGTH = 3
export const BASE_SCORE = 100
export const SHUFFLER_REGEN_EVERY = 3

export const LETTER_COUNT_OPTIONS = [6, 7, 8, 9] as const
export const TIME_LIMIT_OPTIONS: AnagramsTimeLimit[] = [30, 60, 90]

export const MODE_OPTIONS: { value: AnagramsMode; label: string; description: string }[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Use letters without repetition to form words.',
  },
  {
    value: 'reps',
    label: 'Reps',
    description: 'Use letters with repetition to form words.',
  },
  {
    value: 'shuffler',
    label: 'Shuffler',
    description: 'Use letters without repetition to form words. Letters change every 3 words!',
  },
]

export const DEFAULT_CONFIG: AnagramsConfig = {
  letterCount: 7,
  timeLimit: 60,
  mode: 'classic',
}

export const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const

export const CONSONANTS = 'bcdfghjklmnpqrstvwxyz'.split('')

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const VALIDATION_MESSAGES: Record<string, string> = {
  too_short: 'Words must be at least 3 letters.',
  not_in_dictionary: 'Not in the dictionary.',
  invalid_letters: 'Word cannot be formed from the given letters.',
  already_used: 'You already found that word.',
}
