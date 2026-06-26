import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useStats } from '../../stats/useStats'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { WORD_LENGTH_OPTIONS } from './constants'
import { FroggleIcon } from '../../components/icons/FroggleIcon'
import { GuessGrid } from './GuessGrid'
import { Keyboard } from './Keyboard'
import { useFroggleGame } from './useFroggleGame'
import { WordDefinitionOverlay } from './WordDefinitionOverlay'
import type { WordLength } from './types'

const selectorSx = {
  '& .MuiToggleButtonGroup-grouped': {
    borderRadius: 0,
    '&:not(:first-of-type)': {
      marginLeft: '-1px',
    },
    '&:first-of-type': {
      borderRadius: '6px 0 0 6px',
    },
    '&:last-of-type': {
      borderRadius: '0 6px 6px 0',
    },
    '&:only-child': {
      borderRadius: '6px',
    },
  },
  '& .MuiToggleButton-root': {
    px: 2,
    minWidth: 48,
  },
}

function walletStatus(status: string): string {
  if (status === 'won' || status === 'lost') return 'gameover'
  return status
}

export function FroggleGame() {
  const {
    snapshot,
    dictionaryReady,
    start,
    playAgain,
    setWordLength,
    typeLetter,
    backspace,
    submitGuess,
    forfeit,
  } = useFroggleGame()
  const { stats, updateStats } = useStats()
  const savedScoreRef = useRef(false)
  const [defineOpen, setDefineOpen] = useState(false)

  const walletScore = snapshot.status === 'won' ? snapshot.score : 0
  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'froggle',
    walletStatus(snapshot.status),
    walletScore,
  )

  const isPlaying = snapshot.status === 'playing'
  const isIdle = snapshot.status === 'idle'
  const isRoundOver = snapshot.status === 'won' || snapshot.status === 'lost'
  const selectorDisabled = isPlaying

  useEffect(() => {
    if (isPlaying) {
      savedScoreRef.current = false
      setDefineOpen(false)
    }
  }, [isPlaying])

  const defineOutcome =
    snapshot.status === 'won' ? 'won' : snapshot.forfeited ? 'forfeited' : 'lost'

  useEffect(() => {
    if (!isRoundOver || savedScoreRef.current || snapshot.status !== 'won') return

    savedScoreRef.current = true
    const currentHigh = stats.froggle?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.score)

    void updateStats('froggle', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [isRoundOver, snapshot.status, snapshot.score, stats.froggle, updateStats])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isPlaying) return

      if (event.key === 'Enter') {
        event.preventDefault()
        submitGuess()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        backspace()
        return
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault()
        typeLetter(event.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, submitGuess, backspace, typeLetter])

  const bestScore = stats.froggle?.values.highScore

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', width: '100%', maxWidth: 560 }}>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Guesses left
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {isIdle ? '—' : snapshot.guessesRemaining}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Best
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {bestScore != null ? bestScore.toLocaleString() : '—'}
          </Typography>
        </Box>
        {snapshot.status === 'won' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Score
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif', color: 'primary.main' }}>
              {snapshot.score}
            </Typography>
          </Box>
        )}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%',
        }}
      >
        {!dictionaryReady && (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Loading word list…
            </Typography>
          </Stack>
        )}

        {dictionaryReady && (
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
                Word length
              </Typography>
              <Stack direction="row" sx={{ justifyContent: 'center' }}>
                <ToggleButtonGroup
                  exclusive
                  value={snapshot.wordLength}
                  onChange={(_, value: WordLength | null) => value != null && setWordLength(value)}
                  disabled={selectorDisabled}
                  size="small"
                  sx={selectorSx}
                >
                  {WORD_LENGTH_OPTIONS.map((length) => (
                    <ToggleButton key={length} value={length}>
                      {length}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Box>

            {isIdle && (
              <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
                <FroggleIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Guess the hidden word in {snapshot.maxGuesses} tries.
                </Typography>
              </Stack>
            )}

            {!isIdle && (
              <GuessGrid
                wordLength={snapshot.wordLength}
                maxGuesses={snapshot.maxGuesses}
                guesses={snapshot.guesses}
                results={snapshot.results}
                currentGuess={snapshot.currentGuess}
                status={snapshot.status}
                invalidMessage={snapshot.invalidMessage}
              />
            )}

            {!isIdle && (isPlaying || isRoundOver) && (
              <Keyboard
                keyboardState={snapshot.keyboardState}
                onKey={typeLetter}
                onEnter={submitGuess}
                onBackspace={backspace}
                disabled={!isPlaying}
              />
            )}

            {snapshot.status === 'lost' && (
              <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  The word was
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Fredoka", sans-serif',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                  }}
                >
                  {snapshot.targetWord}
                </Typography>
              </Stack>
            )}

            {snapshot.status === 'won' && (
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  fontFamily: '"Fredoka", sans-serif',
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              >
                You solved it! +{snapshot.score} tadpoles
              </Typography>
            )}
          </Stack>
        )}
      </Paper>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
        {dictionaryReady && isIdle && (
          <Button variant="contained" onClick={start}>
            Play
          </Button>
        )}
        {isPlaying && (
          <Button variant="outlined" color="warning" onClick={forfeit}>
            Forfeit
          </Button>
        )}
        {isRoundOver && (
          <>
            <Button variant="outlined" onClick={() => setDefineOpen(true)}>
              Define
            </Button>
            <Button variant="contained" onClick={playAgain}>
              Play again
            </Button>
          </>
        )}
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to the pond
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Faster solves earn more tadpoles — score equals your payout.
      </Typography>

      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />

      <WordDefinitionOverlay
        open={defineOpen}
        word={snapshot.targetWord}
        outcome={defineOutcome}
        score={snapshot.status === 'won' ? snapshot.score : undefined}
        onClose={() => setDefineOpen(false)}
      />
    </Stack>
  )
}
