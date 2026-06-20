import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { useWallet } from '../../wallet/useWallet'
import { formatTadpoles, formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { MIN_BET } from './constants'
import { getHandValue } from './handValue'
import { HiLoPanel } from './HiLoPanel'
import { readPanelPreferences, writePanelPreferences } from './panelPreferences'
import { PlayingCard } from './PlayingCard'
import { StatPanel } from './StatPanel'
import { didShoeJustReshuffle } from './shoe'
import type { TwentyOneSnapshot } from './types'
import { useTwentyOneGame } from './useTwentyOneGame'

const RESULT_BANNER_DELAY_MS = 2000

function TadpoleStack({
  amount,
  iconSize = 28,
  fixedDecimals,
}: {
  amount: number
  iconSize?: number
  fixedDecimals?: number
}) {
  const formatted =
    fixedDecimals != null
      ? formatTadpolesFixed(amount, fixedDecimals)
      : formatTadpoles(amount)
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center', minWidth: 72, flexDirection: 'row' }}>
      <FrogDollarIcon sx={{ color: 'secondary.main', fontSize: iconSize }} />
      <Typography
        variant="h6"
        sx={{
          fontFamily: '"Fredoka", sans-serif',
          fontWeight: 600,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatted}
      </Typography>
    </Stack>
  )
}

function totalStaked(snapshot: TwentyOneSnapshot): number {
  return snapshot.totalStaked
}

function resultHeadline(snapshot: TwentyOneSnapshot): string {
  if (snapshot.lastHandNet > 0) return 'You win!'
  if (snapshot.lastHandNet < 0) return 'You lose'
  return 'Push'
}

function parseBetInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < MIN_BET) return null
  return value
}

export function TwentyOneGame() {
  const {
    snapshot,
    setBet,
    deal,
    hit,
    stand,
    doubleDown,
    split,
    creditWinnings,
    canAct,
    canDouble,
    canSplit,
  } = useTwentyOneGame()
  const { wallet } = useWallet()
  const [panels, setPanels] = useState(readPanelPreferences)
  const [betInput, setBetInput] = useState(String(MIN_BET))
  const [showResultBanner, setShowResultBanner] = useState(false)
  const [reshuffleNoticeOpen, setReshuffleNoticeOpen] = useState(false)
  const creditedResolutionRef = useRef(0)
  const prevDiscardCountRef = useRef<number | null>(null)

  useEffect(() => {
    writePanelPreferences(panels)
  }, [panels])

  useEffect(() => {
    const { discardCount } = snapshot.shoe
    if (didShoeJustReshuffle(prevDiscardCountRef.current, discardCount)) {
      setReshuffleNoticeOpen(true)
    }
    prevDiscardCountRef.current = discardCount
  }, [snapshot.shoe.discardCount])

  useEffect(() => {
    if (snapshot.phase !== 'resolved') {
      setShowResultBanner(false)
      return
    }

    setShowResultBanner(false)
    const resolvedSnapshot = snapshot
    const timeoutId = window.setTimeout(() => {
      setShowResultBanner(true)
      if (creditedResolutionRef.current !== resolvedSnapshot.resolutionId) {
        creditedResolutionRef.current = resolvedSnapshot.resolutionId
        void creditWinnings(resolvedSnapshot)
      }
    }, RESULT_BANNER_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [snapshot.phase, snapshot.resolutionId, creditWinnings])

  const isBetting = snapshot.phase === 'betting' || snapshot.phase === 'resolved'
  const parsedBet = parseBetInput(betInput)
  const activeHand = snapshot.playerHands[snapshot.activeHandIndex]
  const staked = totalStaked(snapshot)
  const dealerValue =
    snapshot.dealerHoleRevealed || snapshot.phase === 'resolved'
      ? getHandValue(snapshot.dealerHand).total
      : getHandValue(snapshot.dealerHand.filter((c) => c.faceUp)).total

  async function handleDeal() {
    const bet = parseBetInput(betInput)
    if (bet === null) return
    await deal(bet)
  }

  function handleBetChange(value: string) {
    setBetInput(value)
    const bet = parseBetInput(value)
    if (bet !== null) {
      setBet(bet)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <ToggleButtonGroup
          size="small"
          value={[
            ...(panels.showStatPanel ? ['stat'] : []),
            ...(panels.showHiLoPanel ? ['hilo'] : []),
          ]}
          onChange={(_, values: string[]) => {
            setPanels({
              showStatPanel: values.includes('stat'),
              showHiLoPanel: values.includes('hilo'),
            })
          }}
        >
          <ToggleButton value="stat">Stats</ToggleButton>
          <ToggleButton value="hilo">Hi-Lo</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'center', lg: 'flex-start' }, justifyContent: 'center' }}
      >
        {panels.showStatPanel && (
          <StatPanel snapshot={snapshot} canDouble={canDouble} canSplit={canSplit} />
        )}

        <Stack spacing={2} sx={{ width: '100%', maxWidth: 520, alignItems: 'center' }}>
          <TadpoleStack amount={wallet.balance} fixedDecimals={2} />

          <Paper
            elevation={0}
            sx={{
              p: 3,
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(20, 31, 26, 0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {showResultBanner && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(8, 14, 12, 0.82)',
                  backdropFilter: 'blur(4px)',
                  px: 3,
                }}
              >
                <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Fredoka", sans-serif',
                      fontWeight: 600,
                      color:
                        snapshot.lastHandNet > 0
                          ? 'primary.main'
                          : snapshot.lastHandNet < 0
                            ? 'error.light'
                            : 'text.primary',
                    }}
                  >
                    {resultHeadline(snapshot)}
                  </Typography>
                  {snapshot.message && (
                    <Typography variant="body1" color="text.secondary">
                      {snapshot.message}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Dealer {snapshot.dealerHand.length > 0 && `· ${dealerValue}`}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, minHeight: 92 }}>
                  {snapshot.dealerHand.map((card, index) => (
                    <PlayingCard key={`dealer-${index}`} card={card} />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Staked
                </Typography>
                <TadpoleStack amount={staked} iconSize={24} />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {snapshot.playerHands.length > 1
                    ? `Your hands (${snapshot.activeHandIndex + 1}/${snapshot.playerHands.length})`
                    : 'Your hand'}
                  {activeHand && ` · ${getHandValue(activeHand.cards).total}`}
                </Typography>
                <Stack spacing={2}>
                  {snapshot.playerHands.map((hand, handIndex) => (
                    <Stack
                      key={`hand-${handIndex}`}
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: 'wrap',
                        gap: 1,
                        p: handIndex === snapshot.activeHandIndex ? 1 : 0,
                        borderRadius: 1,
                        outline:
                          handIndex === snapshot.activeHandIndex && snapshot.phase === 'playing'
                            ? '2px solid'
                            : 'none',
                        outlineColor: 'primary.main',
                      }}
                    >
                      {hand.cards.map((card, cardIndex) => (
                        <PlayingCard key={`p-${handIndex}-${cardIndex}`} card={card} compact />
                      ))}
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {isBetting && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
              <TextField
                type="number"
                size="small"
                label="Bet"
                value={betInput}
                onChange={(event) => handleBetChange(event.target.value)}
                slotProps={{ htmlInput: { min: MIN_BET, step: 1 } }}
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                onClick={handleDeal}
                disabled={
                  parsedBet === null ||
                  wallet.balance < parsedBet ||
                  (snapshot.phase === 'resolved' && !showResultBanner)
                }
              >
                {snapshot.phase === 'resolved' ? 'Deal again' : 'Deal'}
              </Button>
            </Stack>
          )}

          {canAct && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Button variant="contained" onClick={hit}>
                Hit
              </Button>
              <Button variant="outlined" onClick={stand}>
                Stand
              </Button>
              {canDouble && (
                <Button
                  variant="outlined"
                  onClick={() => void doubleDown()}
                  disabled={wallet.balance < (activeHand?.bet ?? 0)}
                >
                  Double
                </Button>
              )}
              {canSplit && (
                <Button
                  variant="outlined"
                  onClick={() => void split()}
                  disabled={wallet.balance < (activeHand?.bet ?? 0)}
                >
                  Split
                </Button>
              )}
            </Stack>
          )}

          <Button component={RouterLink} to="/" variant="text" color="inherit">
            Back to the pond
          </Button>
        </Stack>

        {panels.showHiLoPanel && <HiLoPanel snapshot={snapshot} />}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Dealer stands on 17 · blackjack pays 3:2 · up to 2 splits · no double after split
      </Typography>

      <Snackbar
        open={reshuffleNoticeOpen}
        autoHideDuration={5000}
        onClose={() => setReshuffleNoticeOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setReshuffleNoticeOpen(false)}
          sx={{ width: '100%' }}
        >
          Shoe reshuffled — 6 fresh decks in play. Counts reset.
        </Alert>
      </Snackbar>
    </Box>
  )
}
