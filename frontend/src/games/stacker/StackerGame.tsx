import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { StackerCanvas } from './StackerCanvas'
import { useStackerGame } from './useStackerGame'
import { useStats } from '../../stats/useStats'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'

export function StackerGame() {
  const { snapshot, start, restart, drop } = useStackerGame()
  const { stats, updateStats } = useStats()
  const savedScoreRef = useRef(false)
  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'stacker',
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
    const currentHigh = stats.stacker?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.score)

    void updateStats('stacker', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [snapshot.status, snapshot.score, stats.stacker, updateStats])

  const bestScore = stats.stacker?.values.highScore

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Score
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {snapshot.score}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Best
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {bestScore ?? '—'}
          </Typography>
        </Box>
        {snapshot.lastDrop?.isPerfect && snapshot.status === 'playing' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Last drop
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Fredoka", sans-serif', color: '#fbbf24' }}
            >
              Perfect +5
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
        <StackerCanvas snapshot={snapshot} onDrop={drop} />
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
        {snapshot.status === 'playing' && (
          <Button variant="contained" onClick={drop}>
            Drop
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
        Click, tap, or press [Space] to drop the sliding layer.
        <br />
        Partial overlap +2 | Perfect alignment +5
      </Typography>

      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />
    </Stack>
  )
}
