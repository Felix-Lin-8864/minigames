import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { BettingPanel } from './BettingPanel'
import { TICK_MS } from './constants'
import { RaceTrack } from './RaceTrack'
import { ResultsPanel } from './ResultsPanel'
import { useFroggiesGame } from './useFroggiesGame'

function TadpoleStack({ amount }: { amount: number }) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center', minWidth: 72, flexDirection: 'row' }}>
      <FrogDollarIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
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

function resolveStatusMessage(
  phase: 'betting' | 'racing' | 'resolved',
): string {
  switch (phase) {
    case 'betting':
      return 'Place your bet.'
    case 'racing':
      return 'Racing…'
    case 'resolved':
      return 'Done.'
  }
}

export function FroggiesGame() {
  const {
    snapshot,
    wallet,
    setBetType,
    setSlot,
    setBetAmount,
    setAnimationTick,
    startRace,
    completeRace,
    newRace,
  } = useFroggiesGame()

  const isRacing = snapshot.phase === 'racing'
  const isResolved = snapshot.phase === 'resolved'
  const tickCount = snapshot.tickHistory?.length ?? 0

  useEffect(() => {
    if (!isRacing || tickCount === 0) return

    const timer = window.setTimeout(() => {
      if (snapshot.animationTick >= tickCount - 1) {
        void completeRace()
        return
      }
      setAnimationTick(snapshot.animationTick + 1)
    }, TICK_MS)

    return () => window.clearTimeout(timer)
  }, [
    isRacing,
    tickCount,
    snapshot.animationTick,
    setAnimationTick,
    completeRace,
  ])

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 960, mx: 'auto', alignItems: 'center' }}>
        <TadpoleStack amount={wallet.balance} />

        <Paper
          elevation={0}
          sx={{
            p: 2,
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {resolveStatusMessage(snapshot.phase)}
            </Typography>

            <RaceTrack
              tickHistory={snapshot.tickHistory}
              animationTick={snapshot.animationTick}
            />

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ alignItems: 'flex-start' }}
            >
              {!isResolved && (
                <Box sx={{ flex: 1, width: '100%' }}>
                  <BettingPanel
                    snapshot={snapshot}
                    walletBalance={wallet.balance}
                    onBetTypeChange={setBetType}
                    onSlotChange={setSlot}
                    onBetAmountChange={setBetAmount}
                    onStartRace={() => void startRace()}
                  />
                </Box>
              )}

              {isResolved && snapshot.finishOrder && snapshot.betOutcome && (
                <Box sx={{ width: '100%' }}>
                  <ResultsPanel
                    finishOrder={snapshot.finishOrder}
                    betAmount={snapshot.betAmount}
                    betOutcome={snapshot.betOutcome}
                    onNewRace={newRace}
                  />
                </Box>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
