import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FrogIcon } from '../icons/FrogIcon'

export function DashboardHero() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <FrogIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        <Stack spacing={0.5}>
          <Typography variant="h4">Pond Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Your lily pad of high scores, record times and tadpole wealth. Hop in whenever you&apos;re ready.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
