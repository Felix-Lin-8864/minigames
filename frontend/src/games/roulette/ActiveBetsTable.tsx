import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { formatTadpoles } from '../../wallet/tadpoleAmount'
import { aggregatePendingBets, formatBetSummary } from './betLabels'
import type { Bet } from './bets'
import type { GamePhase } from './types'

interface ActiveBetsTableProps {
  pendingBets: Bet[]
  phase: GamePhase
  onRemoveZone: (zoneKey: string) => void
}

export function ActiveBetsTable({ pendingBets, phase, onRemoveZone }: ActiveBetsTableProps) {
  const disabled = phase === 'revealing'
  const aggregated = aggregatePendingBets(pendingBets)

  if (aggregated.length === 0) return null

  return (
    <Table
      size="small"
      sx={{
        '& .MuiTableCell-root': {
          fontFamily: '"Fredoka", sans-serif',
          borderColor: 'divider',
          py: 0.5,
          px: 1,
        },
        '& .MuiTableCell-head': {
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.7rem',
        },
        '& .MuiTableCell-body': {
          fontSize: '0.8rem',
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell>Bet</TableCell>
          <TableCell align="right">Stake</TableCell>
          <TableCell align="right" sx={{ width: 36, px: 0.5 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {aggregated.map(({ zoneKey, bet, total }) => (
          <TableRow key={zoneKey} hover={!disabled}>
            <TableCell>{formatBetSummary(bet)}</TableCell>
            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTadpoles(total)}
            </TableCell>
            <TableCell align="right" sx={{ px: 0.5 }}>
              <IconButton
                size="small"
                aria-label={`Remove ${formatBetSummary(bet)}`}
                disabled={disabled}
                onClick={() => onRemoveZone(zoneKey)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.light' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
