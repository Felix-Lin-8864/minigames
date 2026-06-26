import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { frogtuneGameMetadata } from '../../games/metadata'
import { formatSignedTadpolesFixed, formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { useWallet } from '../../wallet/useWallet'

interface FrogtuneNetDialogProps {
  open: boolean
  onClose: () => void
}

const amountCellSx = {
  fontFamily: 'monospace',
  fontVariantNumeric: 'tabular-nums',
} as const

export function FrogtuneNetDialog({ open, onClose }: FrogtuneNetDialogProps) {
  const { wallet } = useWallet()

  const rows = frogtuneGameMetadata.map((game) => ({
    id: game.id,
    name: game.name,
    winnings: wallet.frogtuneWinnings[game.id] ?? 0,
    losses: wallet.frogtuneLosses[game.id] ?? 0,
    net: wallet.frogtuneNet[game.id] ?? 0,
  }))

  const totalWinnings = rows.reduce((sum, row) => sum + row.winnings, 0)
  const totalLosses = rows.reduce((sum, row) => sum + row.losses, 0)
  const totalNet = rows.reduce((sum, row) => sum + row.net, 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Frogtune</DialogTitle>
      <DialogContent>
        <Table size="small" sx={{ pb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell align="right">Winnings</TableCell>
              <TableCell align="right">Losses</TableCell>
              <TableCell align="right">Net</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right" sx={{ ...amountCellSx, color: 'success.main' }}>
                  {formatTadpolesFixed(row.winnings, 2)}
                </TableCell>
                <TableCell align="right" sx={{ ...amountCellSx, color: 'error.main' }}>
                  {formatTadpolesFixed(row.losses, 2)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...amountCellSx,
                    color:
                      row.net > 0
                        ? 'success.main'
                        : row.net < 0
                          ? 'error.main'
                          : 'text.primary',
                  }}
                >
                  {formatSignedTadpolesFixed(row.net, 2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell
                align="right"
                sx={{ ...amountCellSx, fontWeight: 600, color: 'success.main' }}
              >
                {formatTadpolesFixed(totalWinnings, 2)}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...amountCellSx, fontWeight: 600, color: 'error.main' }}
              >
                {formatTadpolesFixed(totalLosses, 2)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...amountCellSx,
                  fontWeight: 600,
                  color:
                    totalNet > 0
                      ? 'success.main'
                      : totalNet < 0
                        ? 'error.main'
                        : 'text.primary',
                }}
              >
                {formatSignedTadpolesFixed(totalNet, 2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
