import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BaccaratGame } from '../../games/baccarat/BaccaratGame'

export function BaccaratPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Baccarat</Typography>
        <Typography variant="body1" color="text.secondary">
          Bet on Player, Banker, or Tie — punto banco rules with a six-deck shoe.
        </Typography>
      </Stack>
      <BaccaratGame />
    </Stack>
  )
}
