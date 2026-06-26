import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/system'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ChainPondIcon } from '../../components/icons/ChainPondIcon'
import { useStats } from '../../stats/useStats'
import { TadpoleEarnedSnackbar } from '../../wallet/TadpoleEarnedSnackbar'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import { TURN_TIMER_SECONDS } from './constants'
import { useChainPondGame } from './useChainPondGame'

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
`

const chainListSx = {
  maxHeight: 180,
  overflowY: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(74, 222, 128, 0.4) transparent',
  '&::-webkit-scrollbar': {
    width: 8,
  },
}

function formatEndReason(reason: 'timeout' | 'already_used'): string {
  return reason === 'timeout' ? 'Time ran out' : 'Duplicate word submitted'
}

export function ChainPondGame() {
  const {
    snapshot,
    invalidMessage,
    showPenaltyFlash,
    dictionaryReady,
    start,
    playAgain,
    submitWord,
  } = useChainPondGame()
  const { stats, updateStats } = useStats()
  const [input, setInput] = useState('')
  const [shakeInput, setShakeInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const savedScoreRef = useRef(false)
  const chainListRef = useRef<HTMLDivElement>(null)

  const isPlaying = snapshot.status === 'playing'
  const isIdle = snapshot.status === 'idle'
  const isEnded = snapshot.status === 'ended'

  const walletStatus = isPlaying ? 'playing' : isEnded ? 'gameover' : 'idle'

  const { earnedAmount, showEarnedNotification, dismissNotification } = useCreditWalletOnGameOver(
    'chain-pond',
    walletStatus,
    snapshot.finalTadpoles,
  )

  useEffect(() => {
    if (isPlaying) {
      savedScoreRef.current = false
      setInput('')
      inputRef.current?.focus()
    }
  }, [isPlaying, snapshot.currentTurn.startLetter, snapshot.currentTurn.requiredLength])

  useEffect(() => {
    if (!invalidMessage) return
    setShakeInput(true)
    const timeoutId = window.setTimeout(() => setShakeInput(false), 400)
    return () => window.clearTimeout(timeoutId)
  }, [invalidMessage])

  useEffect(() => {
    const list = chainListRef.current
    if (!list || snapshot.chain.length === 0) return
    list.scrollTop = list.scrollHeight
  }, [snapshot.chain.length])

  useEffect(() => {
    if (!isEnded || savedScoreRef.current) return

    savedScoreRef.current = true
    const currentHigh = stats['chain-pond']?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.validWords)

    void updateStats('chain-pond', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [isEnded, snapshot.validWords, stats, updateStats])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isPlaying || !input.trim()) return
    submitWord(input)
    setInput('')
  }

  const timerFraction = snapshot.currentTurn.timeRemaining / TURN_TIMER_SECONDS
  const timerUrgent = isPlaying && snapshot.currentTurn.timeRemaining < 5
  const bestChain = stats['chain-pond']?.values.highScore

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', width: '100%', maxWidth: 560 }}>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="caption" color="text.secondary">
            Score
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Fredoka", sans-serif',
              color: snapshot.score < 0 ? 'error.main' : 'text.primary',
            }}
          >
            {isIdle ? '—' : snapshot.score}
          </Typography>
          {showPenaltyFlash && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -4,
                right: -20,
                color: 'error.main',
                fontWeight: 700,
                animation: `${shake} 0.4s ease`,
              }}
            >
              −1
            </Typography>
          )}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Chain
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {isIdle ? '—' : snapshot.validWords}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Best chain
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {bestChain != null ? bestChain : '—'}
          </Typography>
        </Box>
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
          <Stack spacing={3}>
            {isIdle && (
              <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
                <ChainPondIcon color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Link words by last letter and match each turn&apos;s required length before the timer
                  runs out.
                </Typography>
              </Stack>
            )}

            {isPlaying && (
              <>
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    This turn
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', width: '100%' }}>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 2,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        Starts with
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{ fontFamily: '"Fredoka", sans-serif', lineHeight: 1.1, fontWeight: 700 }}
                      >
                        {snapshot.currentTurn.startLetter}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 2,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        Length
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{ fontFamily: '"Fredoka", sans-serif', lineHeight: 1.1, fontWeight: 700 }}
                      >
                        {snapshot.currentTurn.requiredLength}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Time left
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"Fredoka", sans-serif',
                        fontWeight: 600,
                        color: timerUrgent ? 'error.main' : 'text.secondary',
                      }}
                    >
                      {Math.ceil(snapshot.currentTurn.timeRemaining)}s
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={timerFraction * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: timerUrgent ? 'error.main' : 'primary.main',
                        transition: 'background-color 0.2s ease',
                      },
                    }}
                  />
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"Fredoka", sans-serif',
                        fontWeight: 600,
                        color:
                          input.length === snapshot.currentTurn.requiredLength
                            ? 'primary.main'
                            : input.length > snapshot.currentTurn.requiredLength
                              ? 'error.main'
                              : 'text.secondary',
                      }}
                    >
                      {input.length} / {snapshot.currentTurn.requiredLength}
                    </Typography>
                  </Stack>
                  <TextField
                    inputRef={inputRef}
                    fullWidth
                    value={input}
                    onChange={(event) => setInput(event.target.value.toUpperCase())}
                    placeholder="Type your word"
                    autoComplete="off"
                    spellCheck={false}
                    error={Boolean(invalidMessage)}
                    helperText={invalidMessage ?? ' '}
                    slotProps={{
                      htmlInput: {
                        style: {
                          textTransform: 'uppercase',
                          fontFamily: '"Fredoka", sans-serif',
                          letterSpacing: '0.08em',
                        },
                      },
                    }}
                    sx={{
                      animation: shakeInput ? `${shake} 0.4s ease` : 'none',
                    }}
                  />
                </Box>
              </>
            )}

            {snapshot.chain.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Chain history
                </Typography>
                <Stack spacing={0.5} sx={chainListSx} ref={chainListRef}>
                  {snapshot.chain.map((word, index) => (
                    <Stack
                      key={`${word}-${index}`}
                      direction="row"
                      spacing={1}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontFamily: '"Fredoka", sans-serif', minWidth: 20 }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"Fredoka", sans-serif', flex: 1 }}>
                        {word}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {word[0]} · {word.length}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {isEnded && (
              <Stack spacing={2} sx={{ alignItems: 'center', py: 1 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
                  Chain ended
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {snapshot.endReason != null ? formatEndReason(snapshot.endReason) : 'Game over'}
                </Typography>
                <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Final score
                    </Typography>
                    <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
                      {snapshot.score}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Tadpoles
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: '"Fredoka", sans-serif', color: 'primary.main' }}
                    >
                      {snapshot.finalTadpoles}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
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
        {isEnded && (
          <Button variant="contained" onClick={playAgain}>
            Play again
          </Button>
        )}
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to the pond
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Valid words earn +1 point. Invalid guesses cost 1 point. Tadpoles = score.
      </Typography>

      <TadpoleEarnedSnackbar
        open={showEarnedNotification}
        amount={earnedAmount ?? 0}
        onClose={dismissNotification}
      />
    </Stack>
  )
}
