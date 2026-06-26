import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PlinkoGame } from '../../games/plinko/PlinkoGame'

export function PlinkoPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Plinko</Typography>
        <Typography variant="body1" color="text.secondary">
          Drop the ball through the pegs — land in a slot to multiply your tadpole bet.
        </Typography>
      </Stack>
      <PlinkoGame />
    </Stack>
  )
}
