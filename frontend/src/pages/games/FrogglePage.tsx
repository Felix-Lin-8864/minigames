import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FroggleGame } from '../../games/froggle/FroggleGame'

export function FrogglePage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Froggle</Typography>
        <Typography variant="body1" color="text.secondary">
          Guess the hidden word — green, yellow, and grey tiles guide each try.
        </Typography>
      </Stack>
      <FroggleGame />
    </Stack>
  )
}
