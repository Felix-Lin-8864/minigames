import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { KEYBOARD_ROWS, TILE_COLORS } from './constants'
import type { LetterResult } from './types'

interface KeyboardProps {
  keyboardState: Record<string, LetterResult>
  onKey: (key: string) => void
  onEnter: () => void
  onBackspace: () => void
  disabled: boolean
}

function keyColors(state: LetterResult | undefined) {
  if (!state) {
    return {
      bgcolor: 'action.hover',
      color: 'text.primary',
      borderColor: 'divider',
    }
  }

  const colors = TILE_COLORS[state]
  return {
    bgcolor: colors.bg,
    color: colors.color,
    borderColor: colors.border,
  }
}

export function Keyboard({ keyboardState, onKey, onEnter, onBackspace, disabled }: KeyboardProps) {
  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      {KEYBOARD_ROWS.map((row) => (
        <Box
          key={row}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            mb: 0.5,
          }}
        >
          {row === 'ZXCVBNM' && (
            <Button
              variant="outlined"
              onClick={onEnter}
              disabled={disabled}
              sx={{
                minWidth: 58,
                px: 1,
                py: 1.25,
                fontFamily: '"Fredoka", sans-serif',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              Enter
            </Button>
          )}

          {row.split('').map((letter) => {
            const colors = keyColors(keyboardState[letter])
            return (
              <Button
                key={letter}
                variant="outlined"
                onClick={() => onKey(letter)}
                disabled={disabled}
                sx={{
                  minWidth: { xs: 28, sm: 34 },
                  px: { xs: 0.5, sm: 0.75 },
                  py: 1.25,
                  fontFamily: '"Fredoka", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  bgcolor: colors.bgcolor,
                  color: colors.color,
                  borderColor: colors.borderColor,
                  '&:hover': {
                    bgcolor: colors.bgcolor,
                    filter: 'brightness(1.05)',
                  },
                }}
              >
                {letter}
              </Button>
            )
          })}

          {row === 'ZXCVBNM' && (
            <Button
              variant="outlined"
              onClick={onBackspace}
              disabled={disabled}
              sx={{
                minWidth: 58,
                px: 1,
                py: 1.25,
                fontFamily: '"Fredoka", sans-serif',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              ⌫
            </Button>
          )}
        </Box>
      ))}
    </Box>
  )
}
