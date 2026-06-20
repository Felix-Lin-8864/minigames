import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpoles } from '../../wallet/tadpoleAmount'
import { MIN_BET } from './constants'
import { getCountInterpretation } from './countInterpretation'
import type { TwentyOneSnapshot } from './types'

interface HiLoPanelProps {
  snapshot: TwentyOneSnapshot
}

export function HiLoPanel({ snapshot }: HiLoPanelProps) {
  const { runningCount, trueCount, totalRemaining, discardCount } = snapshot.shoe
  const decksRemaining = totalRemaining / 52
  const interpretation = getCountInterpretation(trueCount, MIN_BET, discardCount)

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
        Hi-Lo count
      </Typography>
      <Stack spacing={2}>
        <BoxStat label="Running" value={formatCount(runningCount)} />
        <BoxStat label="True" value={formatCount(trueCount)} />
      </Stack>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Interpretation
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: interpretation.ready ? 600 : 400,
            color: interpretation.ready ? 'text.primary' : 'text.secondary',
            mb: 1.5,
          }}
        >
          {interpretation.label}
        </Typography>

        {interpretation.ready && (
          <Stack spacing={1.5}>
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                Suggested bet
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <FrogDollarIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatTadpoles(interpretation.suggestedBet)}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                Est. player edge
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color: interpretation.estimatedEdgePercent >= 0 ? 'primary.main' : 'text.secondary',
                }}
              >
                {formatEdge(interpretation.estimatedEdgePercent)}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        {decksRemaining.toFixed(2)} decks remaining
      </Typography>
    </Paper>
  )
}

function BoxStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Stack>
  )
}

function formatCount(value: number): string {
  const rounded = Math.round(value * 100) / 100
  if (rounded > 0) return `+${rounded}`
  return String(rounded)
}

function formatEdge(percent: number): string {
  const rounded = Math.round(percent * 100) / 100
  if (rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}
