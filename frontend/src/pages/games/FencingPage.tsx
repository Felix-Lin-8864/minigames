import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FencingGame } from '../../games/fencing/FencingGame'

export function FencingPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Fencing</Typography>
        <Typography variant="body1" color="text.secondary">
          Out-lunge the bot in a first-to-5 bout.
        </Typography>
      </Stack>
      <FencingGame />
    </Stack>
  )
}
