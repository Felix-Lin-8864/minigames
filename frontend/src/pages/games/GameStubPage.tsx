import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { FrogIcon } from '../../components/icons/FrogIcon'
import { getGameById } from '../../games/metadata'
import { useStats } from '../../stats/useStats'

interface GameStubPageProps {
  gameId: string
  sampleStat?: Record<string, number>
}

export function GameStubPage({ gameId, sampleStat }: GameStubPageProps) {
  const game = getGameById(gameId)
  const { updateStats } = useStats()

  if (!game) return null

  const Icon = game.icon

  async function handleSetSampleStat() {
    if (!sampleStat) return
    await updateStats(gameId, {
      values: sampleStat,
      lastPlayedAt: new Date().toISOString(),
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Icon sx={{ fontSize: 36 }} />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h4">{game.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {game.description}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: 'text.secondary' }}
          >
            <FrogIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="body2">Still growing legs — coming soon</Typography>
          </Stack>

          {sampleStat && (
            <Button variant="outlined" size="small" onClick={handleSetSampleStat}>
              Set sample stat
            </Button>
          )}

          <Button component={RouterLink} to="/" variant="text" color="inherit">
            Back to the pond
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
