import Box from '@mui/material/Box'
import { keyframes } from '@mui/material/styles'
import { TILE_COLORS } from './constants'
import type { LetterResult } from './types'

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`

interface GuessGridProps {
  wordLength: number
  maxGuesses: number
  guesses: string[]
  results: LetterResult[][]
  currentGuess: string
  status: 'idle' | 'playing' | 'won' | 'lost'
  invalidMessage: string | null
}

function tileState(
  letter: string | undefined,
  result: LetterResult | undefined,
  isCurrentRow: boolean,
): keyof typeof TILE_COLORS {
  if (result) return result
  if (letter) return isCurrentRow ? 'filled' : 'filled'
  return 'empty'
}

export function GuessGrid({
  wordLength,
  maxGuesses,
  guesses,
  results,
  currentGuess,
  status,
  invalidMessage,
}: GuessGridProps) {
  const tileSize = wordLength >= 7 ? 44 : wordLength === 6 ? 48 : 52
  const fontSize = wordLength >= 7 ? '1.25rem' : '1.5rem'
  const winningRowIndex = status === 'won' ? guesses.length - 1 : -1

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: maxGuesses }, (_, rowIndex) => {
          const submittedGuess = guesses[rowIndex]
          const rowResults = results[rowIndex]
          const isActiveRow = status === 'playing' && rowIndex === guesses.length
          const isWinningRow = rowIndex === winningRowIndex

          return (
            <Box
              key={rowIndex}
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${wordLength}, ${tileSize}px)`,
                gap: 0.75,
                justifyContent: 'center',
              }}
            >
              {Array.from({ length: wordLength }, (_, colIndex) => {
                const letter = submittedGuess?.[colIndex] ?? (isActiveRow ? currentGuess[colIndex] : undefined)
                const result = rowResults?.[colIndex]
                const state = tileState(letter, result, isActiveRow)
                const colors = TILE_COLORS[state]

                return (
                  <Box
                    key={colIndex}
                    sx={{
                      width: tileSize,
                      height: tileSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: colors.border,
                      bgcolor: colors.bg,
                      color: colors.color,
                      borderRadius: 1.5,
                      fontFamily: '"Fredoka", sans-serif',
                      fontSize,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                      animation: isWinningRow ? `${bounce} 0.5s ease ${colIndex * 0.1}s 2` : undefined,
                    }}
                  >
                    {letter ?? ''}
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>

      <Box
        sx={{
          minHeight: 28,
          mt: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {invalidMessage && (
          <Box
            component="span"
            sx={{
              color: '#f87171',
              fontFamily: '"Fredoka", sans-serif',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {invalidMessage}
          </Box>
        )}
      </Box>
    </Box>
  )
}
