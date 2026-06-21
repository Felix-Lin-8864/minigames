import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StackerGame } from '../../games/stacker/StackerGame'

export function StackerPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Stacker</Typography>
        <Typography variant="body1" color="text.secondary">
          Drop sliding lily pads onto the stack — perfect alignment earns more points.
        </Typography>
      </Stack>
      <StackerGame />
    </Stack>
  )
}
