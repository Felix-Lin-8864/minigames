import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FroggerCanvas } from './FroggerCanvas'
import { tilesForward } from './gameLogic'
import { useFroggerGame } from './useFroggerGame'
import { useStats } from '../../stats/useStats'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'

export function FroggerGame() {
  const { snapshot, start, restart, move } = useFroggerGame()
  const { stats, updateStats } = useStats()
  const savedScoreRef = useRef(false)
  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'frogger',
    snapshot.status,
    snapshot.score,
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        if (snapshot.status === 'idle') start()
        else if (snapshot.status === 'gameover') restart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [snapshot.status, start, restart])

  useEffect(() => {
    if (snapshot.status === 'playing') {
      savedScoreRef.current = false
    }
  }, [snapshot.status])

  useEffect(() => {
    if (snapshot.status !== 'gameover' || savedScoreRef.current) return

    savedScoreRef.current = true
    const currentHigh = stats.frogger?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.score)

    void updateStats('frogger', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [snapshot.status, snapshot.score, stats.frogger, updateStats])

  const currentDistance = tilesForward(snapshot)

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Stack direction="row" spacing={3}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Best distance
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {snapshot.score} {snapshot.score === 1 ? 'tile' : 'tiles'}
          </Typography>
        </Box>
        {snapshot.status === 'playing' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
              {currentDistance} {currentDistance === 1 ? 'tile' : 'tiles'}
            </Typography>
          </Box>
        )}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%',
          maxWidth: 520,
        }}
      >
        <FroggerCanvas snapshot={snapshot} />
      </Paper>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}
      >
        {snapshot.status === 'idle' && (
          <Button variant="contained" onClick={start}>
            Start
          </Button>
        )}
        {snapshot.status === 'gameover' && (
          <Button variant="contained" onClick={restart}>
            Restart
          </Button>
        )}
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to the pond
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Arrow keys or WASD to hop forward endlessly. Ride logs, avoid traffic, and see how
        far you can go.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ display: { md: 'none' } }}>
        <Button variant="outlined" size="small" onClick={() => move(0, -1)}>
          Up
        </Button>
        <Button variant="outlined" size="small" onClick={() => move(0, 1)}>
          Down
        </Button>
        <Button variant="outlined" size="small" onClick={() => move(-1, 0)}>
          Left
        </Button>
        <Button variant="outlined" size="small" onClick={() => move(1, 0)}>
          Right
        </Button>
      </Stack>
      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />
    </Stack>
  )
}
