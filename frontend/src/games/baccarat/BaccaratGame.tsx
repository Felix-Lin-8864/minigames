import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { CardPlaceholder } from '../cards/PlayingCard'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { snapRequiredBetAmount } from '../betAmount'
import { BettingPanel } from './BettingPanel'
import { HandRow, winningSide } from './HandRow'
import { MIN_BET, BET_STEP, RESULT_BANNER_DELAY_MS } from './constants'
import { isBettingPhase } from './gameLogic'
import type { BaccaratSnapshot } from './types'
import { useBaccaratCardDealAnimation } from './useBaccaratCardDealAnimation'
import { useBaccaratGame } from './useBaccaratGame'

function TadpoleStack({ amount, iconSize = 28 }: { amount: number; iconSize?: number }) {
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
        {formatTadpolesFixed(amount, 2)}
      </Typography>
    </Stack>
  )
}

function SessionTally({ player, banker, tie }: { player: number; banker: number; tie: number }) {
  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Player wins: <strong>{player}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Banker wins: <strong>{banker}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Ties: <strong>{tie}</strong>
      </Typography>
    </Stack>
  )
}

function resultHeadline(snapshot: BaccaratSnapshot): string {
  if (snapshot.lastHandNet > 0) return 'You win!'
  if (snapshot.lastHandNet < 0) return 'You lose'
  return 'Push'
}

function parseBetInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < MIN_BET || value % BET_STEP !== 0) return null
  return value
}

export function BaccaratGame() {
  const {
    snapshot,
    wallet,
    setBetType,
    setBetAmount,
    deal,
    finishDealing,
    creditWinnings,
  } = useBaccaratGame()

  const { isAnimating, isCardVisible, dealSequenceComplete } = useBaccaratCardDealAnimation(snapshot)
  const [betInput, setBetInput] = useState(String(MIN_BET))
  const [showResultBanner, setShowResultBanner] = useState(false)
  const creditedResolutionRef = useRef(0)

  useEffect(() => {
    if (snapshot.phase !== 'dealing') return
    if (!dealSequenceComplete) return

    const timeoutId = window.setTimeout(() => {
      finishDealing()
    }, RESULT_BANNER_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [snapshot.phase, dealSequenceComplete, finishDealing])

  useEffect(() => {
    if (snapshot.phase !== 'resolved') {
      setShowResultBanner(false)
      return
    }

    setShowResultBanner(true)
    if (creditedResolutionRef.current !== snapshot.resolutionId) {
      creditedResolutionRef.current = snapshot.resolutionId
      void creditWinnings(snapshot)
    }
  }, [snapshot.phase, snapshot.resolutionId, creditWinnings])

  const isBetting = isBettingPhase(snapshot.phase)
  const parsedBet = parseBetInput(betInput)
  const hand = snapshot.hand
  const showCardPlaceholders = hand === null
  const showRunningTotals = snapshot.phase === 'dealing' || snapshot.phase === 'resolved'
  const winner = winningSide(snapshot.outcome)
  const staked = snapshot.bet > 0 ? snapshot.bet : snapshot.pendingBet
  const showWinnerHighlight = dealSequenceComplete && hand !== null

  const dealDisabled =
    parsedBet === null ||
    wallet.balance < (parsedBet ?? 0) ||
    isAnimating ||
    (snapshot.phase === 'resolved' && !showResultBanner)

  function handleBetChange(value: string) {
    setBetInput(value)
    const bet = parseBetInput(value)
    if (bet !== null) {
      setBetAmount(bet)
    }
  }

  function handleBetBlur() {
    const snapped = snapRequiredBetAmount(betInput, MIN_BET, BET_STEP)
    setBetInput(String(snapped))
    setBetAmount(snapped)
  }

  async function handleDeal() {
    const bet = parseBetInput(betInput)
    if (bet === null) return
    setBetAmount(bet)
    await deal()
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 520, mx: 'auto', alignItems: 'center' }}>
        <TadpoleStack amount={wallet.balance} />

        <SessionTally
          player={snapshot.sessionTally.player}
          banker={snapshot.sessionTally.banker}
          tie={snapshot.sessionTally.tie}
        />

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
            {showCardPlaceholders ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <CardPlaceholder compact />
                  <CardPlaceholder compact />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CardPlaceholder compact />
                  <CardPlaceholder compact />
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <HandRow
                  label="Banker"
                  cards={hand.bankerCards}
                  finalTotal={hand.bankerTotal}
                  highlight={showWinnerHighlight && winner === 'banker'}
                  isCardVisible={isCardVisible}
                  showTotals={showRunningTotals}
                  animate={snapshot.phase === 'dealing'}
                  dealing={snapshot.phase === 'dealing'}
                />
                <HandRow
                  label="Player"
                  cards={hand.playerCards}
                  finalTotal={hand.playerTotal}
                  highlight={showWinnerHighlight && winner === 'player'}
                  isCardVisible={isCardVisible}
                  showTotals={showRunningTotals}
                  animate={snapshot.phase === 'dealing'}
                  dealing={snapshot.phase === 'dealing'}
                />
                {showWinnerHighlight && snapshot.outcome === 'tie' && (
                  <Typography
                    variant="body2"
                    color="secondary.main"
                    sx={{ textAlign: 'center', fontWeight: 600 }}
                  >
                    Tie
                  </Typography>
                )}
              </Stack>
            )}

            {!showCardPlaceholders && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Staked
                </Typography>
                <TadpoleStack amount={staked} iconSize={24} />
              </Box>
            )}
          </Stack>
        </Paper>

        {isBetting && (
          <BettingPanel
            snapshot={snapshot}
            betInput={betInput}
            onBetTypeChange={setBetType}
            onBetInputChange={handleBetChange}
            onBetInputBlur={handleBetBlur}
            onDeal={() => void handleDeal()}
            dealDisabled={dealDisabled}
            dealLabel={snapshot.phase === 'resolved' ? 'Deal again' : 'Deal'}
          />
        )}
      </Stack>
    </Box>
  )
}
