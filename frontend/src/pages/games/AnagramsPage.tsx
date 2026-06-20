import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AnagramsGame } from '../../games/anagrams/AnagramsGame'

export function AnagramsPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h4">Anagrams</Typography>
        <Typography variant="body1" color="text.secondary">
          Form as many words as you can from the given letters before time runs out.
        </Typography>
      </Stack>
      <AnagramsGame />
    </Stack>
  )
}
