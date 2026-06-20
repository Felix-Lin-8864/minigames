import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RouletteGame } from '../../games/roulette/RouletteGame'

export function RoulettePage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Roulette</Typography>
        <Typography variant="body1" color="text.secondary">
          European single-zero roulette — place your chips and spin the wheel.
        </Typography>
      </Stack>
      <RouletteGame />
    </Stack>
  )
}
