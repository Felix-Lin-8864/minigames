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

interface GameLaunchCardProps {
  game: GameMetadata
}

export function GameLaunchCard({ game }: GameLaunchCardProps) {
  const Icon = game.icon

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
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                opacity: 0.9,
              }}
            >
              <Icon />
            </Box>
            <Typography variant="h6">{game.name}</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {game.description}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          component={RouterLink}
          to={game.route}
          variant="contained"
          color="secondary"
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
