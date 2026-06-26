import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FroggiesGame } from '../../games/froggies/FroggiesGame'

export function FroggiesPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Froggies</Typography>
        <Typography variant="body1" color="text.secondary">
          Five frogs race to the finish — pick the finishing order and bet tadpoles.
        </Typography>
      </Stack>
      <FroggiesGame />
    </Stack>
  )
}
