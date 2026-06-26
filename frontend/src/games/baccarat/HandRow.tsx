import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CardPlaceholder } from '../cards/PlayingCard'
import { DealAnimatedCard } from '../cards/DealAnimatedCard'
import { visibleHandTotal } from './cardDealAnimation'
import type { Card } from '../cards/types'
import type { BaccaratOutcome } from './types'

const DEALING_CARD_SLOTS = 2

interface HandRowProps {
  label: string
  cards: Card[]
  finalTotal: number
  highlight: boolean
  isCardVisible: (card: Card) => boolean
  showTotals: boolean
  animate: boolean
  dealing: boolean
}

export function HandRow({
  label,
  cards,
  finalTotal,
  highlight,
  isCardVisible,
  showTotals,
  animate,
  dealing,
}: HandRowProps) {
  const runningTotal = visibleHandTotal(cards, isCardVisible)
  const displayTotal = showTotals ? (runningTotal ?? finalTotal) : null
  const slotCount = dealing ? DEALING_CARD_SLOTS : cards.length

  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: highlight ? 'secondary.main' : 'divider',
        bgcolor: highlight ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
        boxShadow: highlight ? '0 0 0 1px rgba(74, 222, 128, 0.35)' : 'none',
        width: '100%',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        {displayTotal !== null && (
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: '"Fredoka", sans-serif', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
          >
            {displayTotal}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {Array.from({ length: slotCount }, (_, index) => {
          const card = cards[index]
          if (card) {
            return (
              <DealAnimatedCard
                key={`${card.suit}-${card.rank}-${index}`}
                card={card}
                visible={isCardVisible(card)}
                animate={animate}
                compact
              />
            )
          }
          return <CardPlaceholder key={`placeholder-${index}`} compact />
        })}
      </Stack>
    </Stack>
  )
}

export function winningSide(outcome: BaccaratOutcome | null): 'player' | 'banker' | null {
  if (outcome === 'player') return 'player'
  if (outcome === 'banker') return 'banker'
  return null
}
