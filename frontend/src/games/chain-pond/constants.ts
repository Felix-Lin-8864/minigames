import type { WordLength } from './types'

export const MIN_WORD_LENGTH = 3
export const MAX_WORD_LENGTH = 9

export const TURN_TIMER_SECONDS = 15

export const VALID_WORD_LENGTHS: readonly WordLength[] = [3, 4, 5, 6, 7, 8, 9]

export const MAX_LENGTH_REROLLS = 20

export const INVALID_MESSAGE_DURATION_MS = 2000

export const INVALID_REASON_MESSAGES = {
  wrong_letter: 'Wrong starting letter',
  wrong_length: 'Wrong word length',
  not_in_dictionary: 'Not in word list',
  already_used: 'Word already used in this chain',
} as const
