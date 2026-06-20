import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Link as RouterLink } from 'react-router-dom'
import type { GameMetadata } from '../../games/metadata'
import { formatStatValue, type GameStats } from '../../stats/types'

interface StatCardProps {
  game: GameMetadata
  stats: GameStats | undefined
}

function formatLastPlayed(iso: string | null | undefined): string {
  if (!iso) return 'Never played'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function StatCard({ game, stats }: StatCardProps) {
  const Icon = game.icon
  const primaryField = game.statFields[0]
  const primaryValue = primaryField
    ? stats?.values[primaryField.key]
    : null
  const hasRecord = primaryValue != null

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(74, 222, 128, 0.18)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                opacity: 0.9,
              }}
            >
              <Icon />
            </Box>
            <Box>
              <Typography variant="h6">{game.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLastPlayed(stats?.lastPlayedAt)}
              </Typography>
            </Box>
          </Stack>

          {primaryField && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {primaryField.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: hasRecord ? 'text.primary' : 'text.secondary',
                }}
              >
                {hasRecord
                  ? formatStatValue(primaryValue, primaryField.format)
                  : 'No record yet'}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          component={RouterLink}
          to={game.route}
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon />}
          fullWidth
        >
          Hop in
        </Button>
      </CardActions>
    </Card>
  )
}
