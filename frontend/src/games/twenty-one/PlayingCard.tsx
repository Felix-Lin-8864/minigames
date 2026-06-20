import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { isRedSuit, suitSymbol } from './cards'
import type { Card } from './types'

const SUIT_COLORS = {
  red: '#dc2626',
  black: '#0f172a',
} as const

export function PlayingCard({ card, compact = false }: { card: Card; compact?: boolean }) {
  const width = compact ? 52 : 64
  const height = compact ? 76 : 92

  if (!card.faceUp) {
    return (
      <Box
        sx={{
          width,
          height,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'primary.dark',
          bgcolor: 'primary.main',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(10,20,16,0.15) 0, rgba(10,20,16,0.15) 4px, transparent 4px, transparent 8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          flexShrink: 0,
        }}
      />
    )
  }

  const color = isRedSuit(card.suit) ? SUIT_COLORS.red : SUIT_COLORS.black

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'rgba(15, 23, 42, 0.2)',
        bgcolor: '#f8fafc',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 0.75,
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="div"
          sx={{
            fontFamily: '"Fredoka", sans-serif',
            fontWeight: 700,
            fontSize: compact ? '0.8rem' : '0.9rem',
            lineHeight: 1,
            color,
          }}
        >
          {card.rank}
        </Typography>
        <Typography
          component="div"
          sx={{
            fontSize: compact ? '0.85rem' : '1rem',
            lineHeight: 1,
            color,
          }}
        >
          {suitSymbol(card.suit)}
        </Typography>
      </Box>

      <Typography
        component="div"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: compact ? '1.25rem' : '1.5rem',
          lineHeight: 1,
          color,
          opacity: 0.9,
        }}
      >
        {suitSymbol(card.suit)}
      </Typography>

      <Box sx={{ lineHeight: 1, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
        <Typography
          component="div"
          sx={{
            fontFamily: '"Fredoka", sans-serif',
            fontWeight: 700,
            fontSize: compact ? '0.8rem' : '0.9rem',
            lineHeight: 1,
            color,
          }}
        >
          {card.rank}
        </Typography>
        <Typography
          component="div"
          sx={{
            fontSize: compact ? '0.85rem' : '1rem',
            lineHeight: 1,
            color,
          }}
        >
          {suitSymbol(card.suit)}
        </Typography>
      </Box>
    </Box>
  )
}
