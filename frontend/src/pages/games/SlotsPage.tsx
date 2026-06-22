import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SlotsGame } from '../../games/slots/SlotsGame'

export function SlotsPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Slots</Typography>
        <Typography variant="body1" color="text.secondary">
          Spin the frog reels — match three symbols on the payline to win tadpoles.
        </Typography>
      </Stack>
      <SlotsGame />
    </Stack>
  )
}
