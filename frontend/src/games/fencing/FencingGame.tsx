import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FencingCanvas } from './FencingCanvas'
import { useFencingGame } from './useFencingGame'
import { useStats } from '../../stats/useStats'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'

export function FencingGame() {
  const { snapshot, start, restart } = useFencingGame()
  const { stats, updateStats } = useStats()
  const savedScoreRef = useRef(false)
  const displayScore = Math.max(0, snapshot.finalScore)
  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'fencing',
    snapshot.status,
    displayScore,
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
    const currentHigh = stats.fencing?.values.highScore ?? 0
    const highScore = Math.max(currentHigh, displayScore)

    void updateStats('fencing', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [snapshot.status, displayScore, stats.fencing, updateStats])

  const bestScore = stats.fencing?.values.highScore

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Touches
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            Player {snapshot.playerTouches} — Bot {snapshot.botTouches}
          </Typography>
        </Box>
        {snapshot.status === 'gameover' && (
          <>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Points
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
                {snapshot.finalScore}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tadpoles
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
                {formatTadpolesFixed(snapshot.tadpoles, 2)}
              </Typography>
            </Box>
          </>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Best
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {bestScore ?? '—'}
          </Typography>
        </Box>
      </Stack>

      {snapshot.status === 'gameover' && (
        <Typography
          variant="h6"
          sx={{ fontFamily: '"Fredoka", sans-serif', textAlign: 'center' }}
        >
          {snapshot.playerWon ? 'You win!' : 'Bot wins.'} Final score{' '}
          {snapshot.playerTouches}–{snapshot.botTouches}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%',
          maxWidth: 600,
        }}
      >
        <FencingCanvas snapshot={snapshot} />
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
            Play again
          </Button>
        )}
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to the pond
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        ← → move | ↑ jump | ↓ hold crouch | →→ lunge (low while crouching)
        <br />
        First to 5 touches wins. +3 per touch advantage, +15 bonus for a flawless 5–0 win.
      </Typography>

      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />
    </Stack>
  )
}
