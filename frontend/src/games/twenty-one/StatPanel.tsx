import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CARD_VALUE_KEYS } from './constants'
import { getOptimalMove, OPTIMAL_MOVE_LABELS } from './basicStrategy'
import { dealerUpCardRank } from './hand'
import { PAIR_RESULT_LABELS } from './pairBet'
import type { PairResult } from './pairBet'
import type { TwentyOneSnapshot } from './types'

interface StatPanelProps {
  snapshot: TwentyOneSnapshot
  canDouble: boolean
  canSplit: boolean
}

const PAIR_TIER_KEYS: PairResult[] = ['ace', 'perfect', 'colored', 'mixed', 'none']

export function StatPanel({ snapshot, canDouble, canSplit }: StatPanelProps) {
  const activeHand = snapshot.playerHands[snapshot.activeHandIndex]
  const dealerUp = dealerUpCardRank(snapshot.dealerHand)

  let optimalMove: string = '—'
  if (snapshot.phase === 'playing' && activeHand && dealerUp) {
    const move = getOptimalMove(activeHand.cards, dealerUp, canDouble, canSplit)
    optimalMove = OPTIMAL_MOVE_LABELS[move]
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        width: 200,
        flexShrink: 0,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Card odds
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        {CARD_VALUE_KEYS.map((key) => (
          <Box
            key={key}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            <Typography variant="body2">{key}</Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {snapshot.shoe.probabilities[key]?.toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Optimal play
      </Typography>
      <Typography variant="h6" sx={{ fontFamily: '"Fredoka", sans-serif', mb: 2 }}>
        {optimalMove}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Pair bet odds
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        {PAIR_TIER_KEYS.map((tier) => (
          <Box
            key={tier}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {PAIR_RESULT_LABELS[tier]}
            </Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {(snapshot.shoe.pairBetProbabilities[tier] * 100).toFixed(2)}%
            </Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        {snapshot.shoe.totalRemaining} cards unseen · hand{' '}
        {snapshot.shoe.handsCompleted + 1}/{5}
      </Typography>
    </Paper>
  )
}
