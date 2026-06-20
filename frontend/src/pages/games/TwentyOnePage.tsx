import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TwentyOneGame } from '../../games/twenty-one/TwentyOneGame'

export function TwentyOnePage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Twenty-One</Typography>
        <Typography variant="body1" color="text.secondary">
          Classic blackjack — bet tadpoles, beat the dealer, and toggle stats or Hi-Lo counts.
        </Typography>
      </Stack>
      <TwentyOneGame />
    </Stack>
  )
}
