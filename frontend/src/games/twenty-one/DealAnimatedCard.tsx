import Box from '@mui/material/Box'
import { CardPlaceholder, PlayingCard } from './PlayingCard'
import { CARD_DEAL_DURATION_MS } from './cardDealAnimation'
import type { Card } from './types'

const dealInKeyframes = {
  '@keyframes twentyOneDealIn': {
    from: {
      opacity: 0,
      transform: 'translate(48px, -72px) scale(0.82) rotate(6deg)',
    },
    to: {
      opacity: 1,
      transform: 'translate(0, 0) scale(1) rotate(0deg)',
    },
  },
} as const

interface DealAnimatedCardProps {
  card: Card
  compact?: boolean
  visible: boolean
  animate: boolean
  faceDown?: boolean
}

export function DealAnimatedCard({
  card,
  compact = false,
  visible,
  animate,
  faceDown = false,
}: DealAnimatedCardProps) {
  if (!visible) {
    return faceDown ? <CardPlaceholder compact={compact} faceDown /> : <CardPlaceholder compact={compact} />
  }

  return (
    <Box
      sx={{
        ...dealInKeyframes,
        animation: animate ? `twentyOneDealIn ${CARD_DEAL_DURATION_MS}ms ease-out` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <PlayingCard card={card} compact={compact} />
    </Box>
  )
}
