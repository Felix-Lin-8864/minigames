import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { PAYOUTS, SYMBOL_WEIGHTS } from './constants'
import { DEFAULT_CONFIG, theoreticalRtp } from './gameLogic'
import { sessionNet, sessionRtp, winRate, type SlotsSessionStats } from './sessionStats'
import { SlotSymbolIcon } from './SlotSymbolIcon'
import { SYMBOL_LABELS } from './symbols'

interface StatPanelProps {
  session: SlotsSessionStats
}

function formatPercent(value: number | null, digits = 1): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(digits)}%`
}

export function StatPanel({ session }: StatPanelProps) {
  const net = sessionNet(session)
  const rtp = sessionRtp(session)
  const hitRate = winRate(session)
  const targetRtp = theoreticalRtp(DEFAULT_CONFIG)

  const totalWeight = SYMBOL_WEIGHTS.reduce((sum, weight) => sum + weight, 0)

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        width: 220,
        flexShrink: 0,
        bgcolor: 'rgba(20, 31, 26, 0.4)',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Session
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        <StatRow label="Spins" value={session.spins.toLocaleString()} />
        <StatRow label="Wins" value={session.wins.toLocaleString()} />
        <StatRow label="Losses" value={session.losses.toLocaleString()} />
        <StatRow label="Hit rate" value={formatPercent(hitRate, 2)} />
        <StatRow label="Wagered" value={formatTadpolesFixed(session.totalWagered, 0)} />
        <StatRow label="Won" value={formatTadpolesFixed(session.totalWon, 0)} />
        <StatRow
          label="Net"
          value={formatTadpolesFixed(net, 0)}
          valueColor={net > 0 ? 'success.main' : net < 0 ? 'error.main' : undefined}
        />
        <StatRow label="Biggest win" value={formatTadpolesFixed(session.biggestWin, 0)} />
        <StatRow label="Session RTP" value={formatPercent(rtp, 1)} />
      </Stack>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Symbol odds
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        {DEFAULT_CONFIG.symbols.map((symbol, index) => {
          const pReel = SYMBOL_WEIGHTS[index]! / totalWeight
          const pThree = pReel ** 3
          const contribution = pThree * PAYOUTS[symbol]
          return (
            <Box key={symbol}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SlotSymbolIcon symbol={symbol} size="1rem" />
                  {SYMBOL_LABELS[symbol]}
                </Typography>
                <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {PAYOUTS[symbol]}×
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {(pReel * 100).toFixed(0)}% / reel · {(pThree * 100).toFixed(3)}% 3× · RTP{' '}
                {(contribution * 100).toFixed(1)}%
              </Typography>
            </Box>
          )
        })}
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Theoretical RTP: {(targetRtp * 100).toFixed(1)}%
      </Typography>
    </Paper>
  )
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography
        variant="body2"
        sx={{ fontVariantNumeric: 'tabular-nums', color: valueColor }}
      >
        {value}
      </Typography>
    </Box>
  )
}
