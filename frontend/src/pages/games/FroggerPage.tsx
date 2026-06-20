import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FroggerGame } from '../../games/frogger/FroggerGame'

export function FroggerPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Frogger</Typography>
        <Typography variant="body1" color="text.secondary">
          Cross the road and river to reach the lily pads.
        </Typography>
      </Stack>
      <FroggerGame />
    </Stack>
  )
}
