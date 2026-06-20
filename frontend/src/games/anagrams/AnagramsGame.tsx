import AbcIcon from '@mui/icons-material/Abc'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useWordDictionary } from '../../dictionary/useWordDictionary'
import { useStats } from '../../stats/useStats'
import { useCreditWalletOnGameOver } from '../../wallet/useCreditWalletOnGameOver'
import {
  LETTER_COUNT_OPTIONS,
  MODE_OPTIONS,
  TIME_LIMIT_OPTIONS,
  VALIDATION_MESSAGES,
} from './constants'
import { formatTimeRemaining, findAllValidWords } from './gameLogic'
import type { AnagramsConfig } from './types'
import { useAnagramsGame } from './useAnagramsGame'

const horizontalSelectorSx = {
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
    px: 1.75,
  },
}

const verticalSelectorSx = {
  '& .MuiToggleButtonGroup-grouped': {
    borderRadius: 0,
    '&:not(:first-of-type)': {
      marginTop: '-1px',
    },
    '&:first-of-type': {
      borderRadius: '6px 6px 0 0',
    },
    '&:last-of-type': {
      borderRadius: '0 0 6px 6px',
    },
    '&:only-child': {
      borderRadius: '6px',
    },
  },
  '& .MuiToggleButton-root': {
    px: 1.75,
  },
}

const foundWordsListSx = {
  maxHeight: 160,
  overflowY: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(74, 222, 128, 0.4) transparent',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(74, 222, 128, 0.35)',
    borderRadius: 4,
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(74, 222, 128, 0.55)',
  },
}

function ConfigPanel({
  config,
  onChange,
  disabled,
}: {
  config: AnagramsConfig
  onChange: (config: Partial<AnagramsConfig>) => void
  disabled: boolean
}) {
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={3}
        sx={{ flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Letters
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={config.letterCount}
            onChange={(_, value) => value != null && onChange({ letterCount: value })}
            disabled={disabled}
            size="small"
            sx={{ flexWrap: 'wrap', ...horizontalSelectorSx }}
          >
            {LETTER_COUNT_OPTIONS.map((count) => (
              <ToggleButton key={count} value={count}>
                {count}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Time limit
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={config.timeLimit}
            onChange={(_, value) => value != null && onChange({ timeLimit: value })}
            disabled={disabled}
            size="small"
            sx={horizontalSelectorSx}
          >
            {TIME_LIMIT_OPTIONS.map((seconds) => (
              <ToggleButton key={seconds} value={seconds}>
                {seconds}s
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>

      <Box>
        <ToggleButtonGroup
          exclusive
          value={config.mode}
          onChange={(_, value) => value != null && onChange({ mode: value })}
          disabled={disabled}
          size="small"
          orientation="vertical"
          sx={{ width: '100%', ...verticalSelectorSx }}
        >
          {MODE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5, textTransform: 'none' }}
            >
              <Stack spacing={0.25} sx={{ alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )
}

function LetterTiles({ letters }: { letters: string[] }) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
      {letters.map((letter, index) => (
        <Box
          key={`${letter}-${index}`}
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontFamily: '"Fredoka", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(74, 222, 128, 0.25)',
          }}
        >
          {letter}
        </Box>
      ))}
    </Stack>
  )
}

export function AnagramsGame() {
  const {
    snapshot,
    setConfig,
    start,
    restart,
    submitWord,
    dictionaryReady,
  } = useAnagramsGame()
  const { dictionary } = useWordDictionary()
  const { stats, updateStats } = useStats()
  const [input, setInput] = useState('')
  const [revealedWords, setRevealedWords] = useState<string[] | null>(null)
  const savedScoreRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const foundWordsListRef = useRef<HTMLDivElement>(null)

  useCreditWalletOnGameOver('anagrams', snapshot.status, snapshot.score)

  useEffect(() => {
    if (snapshot.status === 'playing') {
      savedScoreRef.current = false
      inputRef.current?.focus()
    }
  }, [snapshot.status])

  useEffect(() => {
    if (snapshot.status !== 'gameover' || savedScoreRef.current) return

    savedScoreRef.current = true
    const currentHigh = stats.anagrams?.values.highScore ?? 0
    const highScore = Math.max(currentHigh ?? 0, snapshot.score)

    void updateStats('anagrams', {
      values: { highScore },
      lastPlayedAt: new Date().toISOString(),
    })
  }, [snapshot.status, snapshot.score, stats.anagrams, updateStats])

  useEffect(() => {
    if (snapshot.status !== 'gameover' || snapshot.config.mode === 'shuffler') {
      setRevealedWords(null)
    }
  }, [snapshot.status, snapshot.config.mode])

  useEffect(() => {
    const list = foundWordsListRef.current
    if (!list || snapshot.foundWords.length === 0) return

    requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight
    })
  }, [snapshot.foundWords.length])

  function handleReveal() {
    if (!dictionary) return

    if (revealedWords) {
      setRevealedWords(null)
      return
    }

    setRevealedWords(findAllValidWords(snapshot.letters, snapshot.config.mode, dictionary))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const word = input.trim()
    if (!word) return
    submitWord(word)
    setInput('')
  }

  const bestScore = stats.anagrams?.values.highScore
  const isPlaying = snapshot.status === 'playing'
  const isIdle = snapshot.status === 'idle'
  const isGameOver = snapshot.status === 'gameover'
  const canReveal = snapshot.config.mode !== 'shuffler'

  const feedbackMessage =
    snapshot.lastMessage &&
    (snapshot.lastMessageType === 'error'
      ? VALIDATION_MESSAGES[snapshot.lastMessage] ?? snapshot.lastMessage
      : snapshot.lastMessage)

  const foundWordSet = new Set(snapshot.foundWords.map((entry) => entry.word))
  const revealedFoundCount =
    revealedWords?.filter((word) => foundWordSet.has(word)).length ?? 0

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', width: '100%', maxWidth: 560 }}>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Score
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: '"Fredoka", sans-serif' }}>
            {snapshot.score.toLocaleString()}
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
        {isPlaying && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Time
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Fredoka", sans-serif',
                color: snapshot.timeRemainingMs <= 10000 ? '#f87171' : 'inherit',
              }}
            >
              {formatTimeRemaining(snapshot.timeRemainingMs)}
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
              Loading dictionary…
            </Typography>
          </Stack>
        )}

        {dictionaryReady && isIdle && (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <AbcIcon color="primary" />
              <Typography variant="h6">Choose your round</Typography>
            </Stack>
            <ConfigPanel config={snapshot.config} onChange={setConfig} disabled={false} />
          </Stack>
        )}

        {dictionaryReady && (isPlaying || isGameOver) && (
          <Stack spacing={3}>
            <LetterTiles letters={snapshot.letters} />

            {isPlaying && (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a word and press Enter"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  size="small"
                  slotProps={{
                    input: {
                      sx: { fontFamily: '"Fredoka", sans-serif', letterSpacing: '0.04em' },
                    },
                  }}
                />
              </Box>
            )}

            {feedbackMessage && (
              <Alert
                severity={snapshot.lastMessageType === 'success' ? 'success' : 'error'}
                sx={{ py: 0 }}
              >
                {feedbackMessage}
              </Alert>
            )}

            {isGameOver && (
              <Alert severity="info">
                Time&apos;s up! You scored {snapshot.score.toLocaleString()} points with{' '}
                {snapshot.foundWords.length} {snapshot.foundWords.length === 1 ? 'word' : 'words'}.
              </Alert>
            )}

            {snapshot.foundWords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Found words
                </Typography>
                <Box ref={foundWordsListRef} sx={foundWordsListSx}>
                  {snapshot.foundWords.map((entry) => (
                    <Box
                      key={entry.word}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        px: 1.5,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: '"Fredoka", sans-serif', letterSpacing: '0.04em' }}
                      >
                        {entry.word}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        +{entry.points.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {revealedWords && canReveal && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  All valid words — {revealedFoundCount}/{revealedWords.length} found
                </Typography>
                <Box sx={{ ...foundWordsListSx, maxHeight: 240 }}>
                  {revealedWords.map((word) => (
                    <Box
                      key={word}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Fredoka", sans-serif',
                          letterSpacing: '0.04em',
                          color: foundWordSet.has(word) ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {word}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </Paper>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}
      >
        {dictionaryReady && isIdle && (
          <Button variant="contained" onClick={start}>
            Start
          </Button>
        )}
        {isGameOver && (
          <>
            <Button variant="contained" onClick={restart}>
              Play again
            </Button>
            {canReveal && (
              <Button variant="outlined" onClick={handleReveal} disabled={!dictionary}>
                {revealedWords ? 'Hide' : 'Reveal'}
              </Button>
            )}
          </>
        )}
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to the pond
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Longer words score exponentially more (100 pts for 3 letters)!
      </Typography>
    </Stack>
  )
}
