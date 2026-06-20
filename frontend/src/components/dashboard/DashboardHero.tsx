import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FrogIcon } from '../icons/FrogIcon'
import { gameMetadata } from '../../games/metadata'
import type { GameStats } from '../../stats/types'

interface DashboardHeroProps {
  stats: Record<string, GameStats>
}

export function DashboardHero({ stats }: DashboardHeroProps) {
  const recordsSet = gameMetadata.filter((game) => {
    const gameStats = stats[game.id]
    if (!gameStats) return false
    return game.statFields.some((field) => gameStats.values[field.key] != null)
  }).length

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <FrogIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        <Stack spacing={0.5}>
          <Typography variant="h4">Pond Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Your lily pad of high scores and record times. Hop in whenever you&apos;re ready.
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Chip label={`${gameMetadata.length} games in the pond`} variant="outlined" size="small" />
        <Chip
          label={`${recordsSet} personal best${recordsSet === 1 ? '' : 's'}`}
          variant="outlined"
          size="small"
          color={recordsSet > 0 ? 'primary' : 'default'}
        />
      </Stack>
    </Stack>
  )
}
