import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function DashboardHero() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Your lily pad of high scores, record times and tadpole wealth. Hop in whenever you&apos;re ready.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
