import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FROG_COLOURS, FROG_LABELS, ORDINAL_LABELS } from './constants'
import type { BetOutcome, FrogColour } from './types'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'

interface ResultsPanelProps {
  finishOrder: FrogColour[]
  betAmount: number
  betOutcome: BetOutcome
  onNewRace: () => void
}

export function ResultsPanel({
  finishOrder,
  betAmount,
  betOutcome,
  onNewRace,
}: ResultsPanelProps) {
  const winner = finishOrder[0]

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ alignItems: 'flex-start', width: '100%' }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'left' }}
          >
            Finish order
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {finishOrder.map((frog, index) => (
              <Stack
                key={frog}
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: frog === winner ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ width: 32, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                >
                  {ORDINAL_LABELS[index]}
                </Typography>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.5,
                    bgcolor: FROG_COLOURS[frog],
                    border: frog === 'yellow' ? '1px solid rgba(255,255,255,0.35)' : 'none',
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{ fontFamily: '"Fredoka", sans-serif', fontWeight: 600 }}
                >
                  {FROG_LABELS[frog]}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Stack
          spacing={0.5}
          sx={{
            p: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: betOutcome.won ? 'success.dark' : 'divider',
            bgcolor: betOutcome.won ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255,255,255,0.03)',
            minWidth: { sm: 200 },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Stake: {formatTadpolesFixed(betAmount, 2)} tadpoles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payout: {formatTadpolesFixed(betOutcome.payout, 2)} tadpoles
          </Typography>
        </Stack>
      </Stack>

      <Button
        variant="contained"
        size="large"
        onClick={onNewRace}
        sx={{ alignSelf: 'flex-start', fontFamily: '"Fredoka", sans-serif' }}
      >
        Place New Bets
      </Button>
    </Stack>
  )
}
