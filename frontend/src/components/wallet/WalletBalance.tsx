import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { FrogDollarIcon } from '../icons/FrogDollarIcon'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { useWallet } from '../../wallet/useWallet'

const chipSx = {
  height: 30,
  fontSize: '0.8125rem',
  fontWeight: 600,
  borderRadius: 1,
  '& .MuiChip-icon': {
    fontSize: 26,
    marginLeft: '5px',
    marginRight: '-4px',
  },
  '& .MuiChip-label': {
    px: 1.25,
  },
} as const

export function WalletBalance() {
  const { wallet, loading } = useWallet()

  const amount = loading ? '…' : formatTadpolesFixed(wallet.balance)
  const tooltip = loading
    ? 'Loading wallet…'
    : `Balance: ${formatTadpolesFixed(wallet.balance)} · All-time high: ${formatTadpolesFixed(wallet.allTimeHigh)}`

  return (
    <Tooltip title={tooltip}>
      <Chip
        icon={<FrogDollarIcon sx={{ color: 'secondary.main', fontSize: 26 }} />}
        label={amount}
        color="secondary"
        variant="outlined"
        sx={chipSx}
      />
    </Tooltip>
  )
}
