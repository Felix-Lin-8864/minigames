import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { BettingTable } from './BettingTable'
import { RESULT_OVERLAY_DELAY_MS, WHEEL_SPIN_MS } from './constants'
import { RecentSpins } from './RecentSpins'
import { SpinSidePanel } from './SpinSidePanel'
import { useRouletteGame } from './useRouletteGame'
import { useElementHeight } from './useElementSize'

type RevealStage = 'idle' | 'wheel' | 'results'

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

export function RouletteGame() {
  const {
    snapshot,
    wallet,
    setChip,
    setBoostAmount,
    placeBet,
    clearBets,
    rebet,
    spin,
    completeRound,
  } = useRouletteGame()

  const [revealStage, setRevealStage] = useState<RevealStage>('idle')
  const tableRef = useRef<HTMLDivElement>(null)
  const tableHeight = useElementHeight(tableRef)

  const isRevealing = snapshot.phase === 'revealing'
  const showResults = revealStage === 'results'
  const showBoostOnTable = isRevealing && snapshot.boostedPocket != null

  useEffect(() => {
    if (!isRevealing || snapshot.spinResult === null) {
      setRevealStage('idle')
      return
    }

    setRevealStage('wheel')
    const resultsTimer = window.setTimeout(() => {
      setRevealStage('results')
    }, WHEEL_SPIN_MS + RESULT_OVERLAY_DELAY_MS)

    return () => window.clearTimeout(resultsTimer)
  }, [isRevealing, snapshot.spinResult])

  function handlePlayAgain() {
    void completeRound()
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 1040, mx: 'auto', alignItems: 'center' }}>
        <TadpoleStack amount={wallet.balance} />

        <RecentSpins spins={snapshot.recentSpins} />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(20, 31, 26, 0.6)',
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: 'stretch' }}
            >
              <Box ref={tableRef} sx={{ flexShrink: 0, alignSelf: { xs: 'center', md: 'flex-start' } }}>
                <BettingTable
                  pendingBets={snapshot.pendingBets}
                  selectedChip={snapshot.selectedChip}
                  phase={snapshot.phase}
                  spinResult={showResults ? snapshot.spinResult : null}
                  boostedPocket={showBoostOnTable ? snapshot.boostedPocket : null}
                  onPlaceBet={placeBet}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  width: { xs: '100%', md: 'auto' },
                  minWidth: { md: 280 },
                  display: 'flex',
                  minHeight: tableHeight,
                }}
              >
                <SpinSidePanel
                  snapshot={snapshot}
                  revealStage={revealStage}
                  panelHeight={tableHeight}
                  walletBalance={wallet.balance}
                  onBetAmountChange={setChip}
                  onBoostAmountChange={setBoostAmount}
                  onSpin={() => void spin()}
                  onRebet={rebet}
                  onClearBets={clearBets}
                  onPlayAgain={handlePlayAgain}
                />
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Tap a number or outside area to place a bet. Use edges between numbers for splits,
              corners, and six-lines.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
