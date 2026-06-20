import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SnakeGame } from '../../games/snake/SnakeGame'

export function SnakePage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Snake</Typography>
        <Typography variant="body1" color="text.secondary">
          Slither around the pond and eat every dot you can find.
        </Typography>
      </Stack>
      <SnakeGame />
    </Stack>
  )
}
