import type { WordLength } from './types'

export const WORD_LENGTH_OPTIONS: WordLength[] = [5, 6, 7, 8]

export const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const

export const TILE_COLORS = {
  empty: {
    bg: 'transparent',
    border: 'divider',
    color: 'text.primary',
  },
  filled: {
    bg: 'action.hover',
    border: 'text.secondary',
    color: 'text.primary',
  },
  green: {
    bg: '#4ade80',
    border: '#4ade80',
    color: '#0a1210',
  },
  yellow: {
    bg: '#facc15',
    border: '#facc15',
    color: '#0a1210',
  },
  grey: {
    bg: '#64748b',
    border: '#64748b',
    color: '#f8fafc',
  },
} as const

export const INVALID_MESSAGE_DURATION_MS = 1500
