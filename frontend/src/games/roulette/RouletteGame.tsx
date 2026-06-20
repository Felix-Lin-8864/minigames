import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { NumericInput } from '../../components/NumericInput'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpoles, formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { BettingTable } from './BettingTable'
import { MIN_BET } from './constants'
import { NUMBER_DATA } from './numberData'
import { pocketColorSx, RecentSpins } from './RecentSpins'
import { useRouletteGame } from './useRouletteGame'

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

function parseBetInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < MIN_BET) return null
  return value
}

export function RouletteGame() {
  const {
    snapshot,
    wallet,
    setChip,
    placeBet,
    clearBets,
    rebet,
    spin,
    completeRound,
  } = useRouletteGame()

  const [betInput, setBetInput] = useState(String(MIN_BET))

  const isBetting = snapshot.phase === 'betting'
  const showOverlay = snapshot.phase === 'revealing'
  const canSpin =
    isBetting && snapshot.pendingBets.length > 0 && wallet.balance >= snapshot.totalStaked

  function handleBetInputChange(value: string) {
    setBetInput(value)
    const parsed = parseBetInput(value)
    if (parsed !== null) setChip(parsed)
  }

  function handlePlayAgain() {
    void completeRound()
  }

  const spinColor = snapshot.spinResult != null ? NUMBER_DATA[snapshot.spinResult]!.color : null

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto', alignItems: 'center' }}>
        <TadpoleStack amount={wallet.balance} fixedDecimals={2} />

        <RecentSpins spins={snapshot.recentSpins} />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(20, 31, 26, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {showOverlay && snapshot.spinResult !== null && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(8, 14, 12, 0.88)',
                backdropFilter: 'blur(4px)',
                px: 3,
              }}
            >
              <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">
                  Winning number
                </Typography>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Fredoka", sans-serif',
                    fontWeight: 700,
                    fontSize: '2rem',
                    ...(spinColor ? pocketColorSx(spinColor) : {}),
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {snapshot.spinResult}
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {spinColor}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: '"Fredoka", sans-serif',
                    fontWeight: 600,
                    color:
                      snapshot.lastSpinNet > 0
                        ? 'primary.main'
                        : snapshot.lastSpinNet < 0
                          ? 'error.light'
                          : 'text.primary',
                  }}
                >
                  {snapshot.lastSpinNet > 0
                    ? 'You win!'
                    : snapshot.lastSpinNet < 0
                      ? 'You lose'
                      : 'Break even'}
                </Typography>
                {snapshot.message && (
                  <Typography variant="body1" color="text.secondary">
                    {snapshot.message}
                  </Typography>
                )}
                <Button variant="contained" color="secondary" onClick={handlePlayAgain}>
                  Play again
                </Button>
              </Stack>
            </Box>
          )}

          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'flex-end',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <NumericInput
                label="Bet"
                value={betInput}
                onChange={handleBetInputChange}
                min={MIN_BET}
                step={1}
              />
              {isBetting && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => void spin()}
                    disabled={!canSpin}
                  >
                    Spin
                  </Button>
                  {snapshot.canRebet && (
                    <Button variant="outlined" color="secondary" onClick={rebet}>
                      Rebet
                    </Button>
                  )}
                </>
              )}
            </Stack>

            <BettingTable
              pendingBets={snapshot.pendingBets}
              selectedChip={snapshot.selectedChip}
              phase={snapshot.phase}
              spinResult={snapshot.spinResult}
              onPlaceBet={placeBet}
            />

            {snapshot.pendingBets.length > 0 && (
              <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Total staked: {formatTadpoles(snapshot.totalStaked)}
              </Typography>
            )}

            {isBetting && snapshot.pendingBets.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                <Button variant="outlined" color="inherit" onClick={clearBets}>
                  Clear bets
                </Button>
              </Stack>
            )}

            {isBetting &&
              snapshot.pendingBets.length > 0 &&
              wallet.balance < snapshot.totalStaked && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Not enough tadpoles to cover all bets.
                </Alert>
              )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
