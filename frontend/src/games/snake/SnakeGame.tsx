import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { DirectionalPad } from '../../components/DirectionalPad'
import { SnakeCanvas } from './SnakeCanvas'
import { useSnakeGame } from './useSnakeGame'
import { useStats } from '../../stats/useStats'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'

export function SnakeGame() {
  const { snapshot, start, restart, setDirection } = useSnakeGame()
  const { stats, updateStats } = useStats()
  const savedScoreRef = useRef(false)
  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'snake',
    snapshot.status,
    snapshot.score,
  )

  useEffect(() => {
    if (snapshot.status === 'playing') {
      savedScoreRef.current = false
    }
  }, [snapshot.status])

  useEffect(() => {
    if (snapshot.status !== 'gameover' || savedScoreRef.current) return

    savedScoreRef.current = true
    const currentHigh = stats.snake?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.score)

    void updateStats('snake', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [snapshot.status, snapshot.score, stats.snake, updateStats])

  const bestScore = stats.snake?.values.highScore

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
        {snapshot.wallBreaksRemaining > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Wall breaks
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Fredoka", sans-serif', color: '#f87171' }}
            >
              {snapshot.wallBreaksRemaining}
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
        <SnakeCanvas snapshot={snapshot} />
      </Paper>

      {snapshot.status === 'playing' && (
        <DirectionalPad
          onUp={() => setDirection('up')}
          onDown={() => setDirection('down')}
          onLeft={() => setDirection('left')}
          onRight={() => setDirection('right')}
        />
      )}

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
        Green +1 | Gold +3 | Purple length - 1 | Red smash 1 wall<br/>
        Every 10 points the map reshuffles.<br/>
      </Typography>

      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />
    </Stack>
  )
}
