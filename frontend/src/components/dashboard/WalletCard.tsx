import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FrogDollarIcon } from '../icons/FrogDollarIcon'
import { useWallet } from '../../wallet/useWallet'

const statValueSx = {
  fontFamily: '"Fredoka", sans-serif',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  fontSize: 'clamp(1.75rem, 2.5vw + 1rem, 3rem)',
  lineHeight: 1.1,
  minHeight: '1.1em',
} as const

interface WalletStatProps {
  label: string
  value: string
}

function WalletStat({ label, value }: WalletStatProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 0.25 }}>
        {label}
      </Typography>

      <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center' }}>
        <FrogDollarIcon
          sx={{
            color: 'secondary.contrastText',
            fontSize: 'clamp(1.65rem, 2.2vw + 0.9rem, 2.35rem)',
            flexShrink: 0,
          }}
        />
        <Typography component="div" sx={statValueSx}>
          {Number(value).toFixed(2)}
        </Typography>
      </Stack>
    </Box>
  )
}

export function WalletCard() {
  const { wallet, loading } = useWallet()

  const balance = loading ? '—' : wallet.balance.toLocaleString()
  const allTimeHigh = loading ? '—' : wallet.allTimeHigh.toLocaleString()

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'secondary.light',
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Tadpole Wallet</Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
              columnGap: 4,
              rowGap: 2,
              alignItems: 'start',
            }}
          >
            <WalletStat label="Balance" value={balance} />
            <WalletStat label="All-time high" value={allTimeHigh} />
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Play Snake and Frogger to earn score as tadpoles. Anagrams pays ceiling(score ÷ 400).
            Save up for Frogtune games — coming soon to the pond.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
