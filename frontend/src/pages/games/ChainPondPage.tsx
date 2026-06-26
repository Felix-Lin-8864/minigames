import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ChainPondGame } from '../../games/chain-pond/ChainPondGame'

export function ChainPondPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Chain Pond</Typography>
        <Typography variant="body1" color="text.secondary">
          Build a word chain — match the starting letter and length each turn before time runs out.
        </Typography>
      </Stack>
      <ChainPondGame />
    </Stack>
  )
}
