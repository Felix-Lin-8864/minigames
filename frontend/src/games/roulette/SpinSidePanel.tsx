import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { NumericInput } from '../../components/NumericInput'
import { formatTadpoles } from '../../wallet/tadpoleAmount'
import { MIN_BET, WHEEL_SPIN_MS } from './constants'
import { NUMBER_DATA } from './numberData'
import { pocketColorSx } from './RecentSpins'
import { RouletteWheel } from './RouletteWheel'
import type { RouletteSnapshot } from './types'
import { useSquareFitSize } from './useElementSize'

type RevealStage = 'idle' | 'wheel' | 'results'

interface SpinSidePanelProps {
  snapshot: RouletteSnapshot
  revealStage: RevealStage
  panelHeight?: number
  walletBalance: number
  onBetAmountChange: (amount: number) => void
  onBoostAmountChange: (amount: number) => void
  onSpin: () => void
  onRebet: () => void
  onClearBets: () => void
  onPlayAgain: () => void
}

function parseBetInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < MIN_BET) return null
  return value
}

function parseBoostInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '0') return 0
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

function PocketBadge({
  number,
  label,
  outline,
}: {
  number: number
  label: string
  outline?: boolean
}) {
  const color = NUMBER_DATA[number]!.color
  return (
    <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
      <Typography variant="overline" color={outline ? 'warning.main' : 'text.secondary'}>
        {label}
      </Typography>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Fredoka", sans-serif',
          fontWeight: 700,
          fontSize: '1.75rem',
          ...(outline
            ? {
                outline: '3px solid',
                outlineColor: 'warning.main',
                outlineOffset: 2,
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
              }
            : { boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }),
          ...pocketColorSx(color),
        }}
      >
        {number}
      </Box>
      <Typography
        variant="body2"
        color={outline ? 'warning.main' : 'text.secondary'}
        sx={{ textTransform: 'capitalize' }}
      >
        {color}
      </Typography>
    </Stack>
  )
}

export function SpinSidePanel({
  snapshot,
  revealStage,
  panelHeight,
  walletBalance,
  onBetAmountChange,
  onBoostAmountChange,
  onSpin,
  onRebet,
  onClearBets,
  onPlayAgain,
}: SpinSidePanelProps) {
  const [betInput, setBetInput] = useState(String(MIN_BET))
  const [boostInput, setBoostInput] = useState('0')
  const [wheelSettled, setWheelSettled] = useState(false)
  const wheelAreaRef = useRef<HTMLDivElement>(null)
  const wheelSize = useSquareFitSize(wheelAreaRef, revealStage === 'wheel')

  const isBetting = snapshot.phase === 'betting'
  const showControls = isBetting && revealStage === 'idle'
  const canSpin =
    showControls &&
    snapshot.pendingBets.length > 0 &&
    walletBalance >= snapshot.totalWager
  const canRebet = showControls && snapshot.canRebet
  const canClearBets = showControls && snapshot.pendingBets.length > 0

  function handleBetInputChange(value: string) {
    setBetInput(value)
    const parsed = parseBetInput(value)
    if (parsed !== null) onBetAmountChange(parsed)
  }

  function handleBoostInputChange(value: string) {
    setBoostInput(value)
    const parsed = parseBoostInput(value)
    if (parsed !== null) onBoostAmountChange(parsed)
  }

  useEffect(() => {
    if (revealStage !== 'wheel') {
      setWheelSettled(false)
      return
    }
    const timer = window.setTimeout(() => setWheelSettled(true), WHEEL_SPIN_MS)
    return () => window.clearTimeout(timer)
  }, [revealStage, snapshot.spinResult])

  const hadBoost = snapshot.boostAmount > 0 && snapshot.boostedPocket != null
  const showWheel = revealStage === 'wheel' && snapshot.spinResult !== null
  const showResults = revealStage === 'results' && snapshot.spinResult !== null

  return (
    <Box
      sx={{
        width: '100%',
        height: panelHeight ?? '100%',
        minHeight: panelHeight,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'rgba(0, 0, 0, 0.2)',
        p: 2,
        boxSizing: 'border-box',
        gap: 1.5,
      }}
    >
      {showControls && (
        <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <NumericInput
              label="Bet"
              value={betInput}
              onChange={handleBetInputChange}
              min={MIN_BET}
              step={1}
            />
            <NumericInput
              label="Boost"
              value={boostInput}
              onChange={handleBoostInputChange}
              min={0}
              step={1}
              placeholder="0"
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onSpin}
              disabled={!canSpin}
              sx={{ flex: 1, minWidth: 88 }}
            >
              Spin
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onRebet}
              disabled={!canRebet}
              sx={{ flex: 1, minWidth: 88 }}
            >
              Rebet
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClearBets}
              disabled={!canClearBets}
              sx={{ flex: 1, minWidth: 88 }}
            >
              Clear bets
            </Button>
          </Stack>

          {(snapshot.pendingBets.length > 0 || snapshot.boostCost > 0) && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Total staked: {formatTadpoles(snapshot.totalStaked)}
              {snapshot.boostCost > 0 && ` · Boost: ${formatTadpoles(snapshot.boostCost)}`}
              {snapshot.totalWager > 0 &&
                ` · Total wager: ${formatTadpoles(snapshot.totalWager)}`}
            </Typography>
          )}

          {snapshot.pendingBets.length > 0 && walletBalance < snapshot.totalWager && (
            <Alert severity="warning" sx={{ py: 0.25 }}>
              Not enough tadpoles to cover all bets
              {snapshot.boostCost > 0 ? ' and the boost.' : '.'}
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Boost costs tadpoles equal to the boost amount (any amount above 0) and applies that
            same multiplier to a random pocket, shown on the table when you spin. Enter 0 to opt
            out.
          </Typography>
        </Stack>
      )}

      <Box
        ref={wheelAreaRef}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {revealStage === 'idle' && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
            Wheel spins here when you play
          </Typography>
        )}

        {showWheel && (
          <Stack
            spacing={1}
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                flex: 1,
                width: '100%',
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {wheelSize != null && wheelSize > 0 && (
                <RouletteWheel
                  key={snapshot.spinResult}
                  winningPocket={snapshot.spinResult!}
                  size={wheelSize}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {wheelSettled ? 'Result locked in…' : 'Spinning…'}
            </Typography>
          </Stack>
        )}

      {showResults && (
        <Stack
          spacing={2}
          sx={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'auto',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}
          >
            <PocketBadge number={snapshot.spinResult!} label="Winning number" />
            {hadBoost && snapshot.boostedPocket != null && (
              <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
                <PocketBadge number={snapshot.boostedPocket} label="Boosted pocket" outline />
                <Typography variant="body2" color="warning.main">
                  {snapshot.boostAmount}× multiplier
                  {snapshot.multiplierHit ? ' · applied' : ''}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Typography
            variant="h5"
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
            <Typography variant="body2" color="text.secondary">
              {snapshot.message}
            </Typography>
          )}
          <Button variant="contained" color="secondary" onClick={onPlayAgain}>
            Play again
          </Button>
        </Stack>
      )}
      </Box>
    </Box>
  )
}
