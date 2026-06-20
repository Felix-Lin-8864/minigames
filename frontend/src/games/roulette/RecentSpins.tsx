import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { NUMBER_DATA, type PocketColor } from './numberData'

interface RecentSpinsProps {
  spins: number[]
}

function pocketColorSx(color: PocketColor) {
  switch (color) {
    case 'red':
      return { bgcolor: '#b91c1c', color: '#fff' }
    case 'black':
      return { bgcolor: '#1a1a1a', color: '#fff' }
    case 'green':
      return { bgcolor: '#15803d', color: '#fff' }
  }
}

export function RecentSpins({ spins }: RecentSpinsProps) {
  if (spins.length === 0) return null

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom>
        Recent spins
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {spins.map((n, i) => (
          <Box
            key={`${n}-${i}`}
            sx={{
              minWidth: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: '"Fredoka", sans-serif',
              ...pocketColorSx(NUMBER_DATA[n]!.color),
            }}
          >
            {n}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export { pocketColorSx }
