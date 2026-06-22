import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { NumericInput } from '../../components/NumericInput'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import { MIN_BET, PARTIAL_PAYOUTS, PAYOUTS, REEL_STOP_MS, SPIN_DURATION_MS } from './constants'
import { DEFAULT_CONFIG } from './gameLogic'
import { randomFillerSymbol, SlotReel, SYMBOL_HEIGHT } from './SlotReel'
import { readPanelPreferences, writePanelPreferences } from './panelPreferences'
import { StatPanel } from './StatPanel'
import { SlotSymbolIcon } from './SlotSymbolIcon'
import { SYMBOL_LABELS } from './symbols'
import type { SlotSymbol } from './types'
import { useSlotsGame } from './useSlotsGame'

const DEFAULT_DISPLAY: [SlotSymbol, SlotSymbol, SlotSymbol] = ['fly', 'reed', 'droplet']

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

function parseBetInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const value = Math.floor(Number(trimmed))
  if (!Number.isFinite(value) || value < MIN_BET) return null
  return value
}

function PayoutTable() {
  const partialSymbols = DEFAULT_CONFIG.symbols.filter(
    (symbol) => PARTIAL_PAYOUTS[symbol] != null,
  )

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          3-of-a-kind payouts
        </Typography>
        {DEFAULT_CONFIG.symbols.map((symbol) => (
          <Stack
            key={symbol}
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SlotSymbolIcon symbol={symbol} size="1.25rem" />
              {SYMBOL_LABELS[symbol]}
            </Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {PAYOUTS[symbol]}×
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          2-of-a-kind partial payouts
        </Typography>
        {partialSymbols.map((symbol) => (
          <Stack
            key={symbol}
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SlotSymbolIcon symbol={symbol} size="1.25rem" />
              {SYMBOL_LABELS[symbol]}
            </Typography>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {PARTIAL_PAYOUTS[symbol]}×{PARTIAL_PAYOUTS[symbol] === 1 ? ' (refund)' : ''}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

export function SlotsGame() {
  const { snapshot, wallet, sessionStats, setBet, spin, completeSpin, canSpin, isSpinning } =
    useSlotsGame()
  const [panels, setPanels] = useState(readPanelPreferences)
  const [betInput, setBetInput] = useState(String(MIN_BET))
  const [spinId, setSpinId] = useState(0)
  const [fillerSymbols, setFillerSymbols] = useState<
    [SlotSymbol, SlotSymbol, SlotSymbol, SlotSymbol, SlotSymbol, SlotSymbol]
  >(['droplet', 'lilypad', 'caterpillar', 'egg', 'goldenfrog', 'fly'])

  const displayReels = snapshot.reels ?? DEFAULT_DISPLAY
  const showWinHighlight = snapshot.phase === 'revealed' && snapshot.multiplier > 0

  const reelFiller = useMemo(
    () =>
      [0, 1, 2].map((i) => ({
        top: fillerSymbols[i * 2]!,
        bottom: fillerSymbols[i * 2 + 1]!,
      })),
    [fillerSymbols],
  )

  useEffect(() => {
    writePanelPreferences(panels)
  }, [panels])

  useEffect(() => {
    if (!isSpinning) return

    setSpinId((id) => id + 1)
    setFillerSymbols([
      randomFillerSymbol(),
      randomFillerSymbol(),
      randomFillerSymbol(),
      randomFillerSymbol(),
      randomFillerSymbol(),
      randomFillerSymbol(),
    ])

    const timer = window.setTimeout(() => {
      void completeSpin()
    }, SPIN_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [isSpinning, completeSpin])

  async function handleSpin() {
    const bet = parseBetInput(betInput)
    if (bet === null) return
    await spin(bet)
  }

  function handleBetChange(value: string) {
    setBetInput(value)
    const bet = parseBetInput(value)
    if (bet !== null) {
      setBet(bet)
    }
  }

  const insufficientBalance = wallet.balance < MIN_BET
  const parsedBet = parseBetInput(betInput)
  const betTooLow = parsedBet === null
  const spinDisabled = !canSpin || isSpinning || betTooLow || insufficientBalance

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <ToggleButtonGroup
          size="small"
          value={panels.showStatPanel ? ['stat'] : []}
          onChange={(_, values: string[]) => {
            setPanels({ showStatPanel: values.includes('stat') })
          }}
        >
          <ToggleButton value="stat">Stats</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'center', lg: 'flex-start' }, justifyContent: 'center' }}
      >
        {panels.showStatPanel && <StatPanel session={sessionStats} />}

        <Stack spacing={2} sx={{ width: '100%', maxWidth: 640, alignItems: 'center' }}>
          <TadpoleStack amount={wallet.balance} />

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
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ position: 'relative', width: 'fit-content' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: SYMBOL_HEIGHT,
                  left: -8,
                  right: -8,
                  height: SYMBOL_HEIGHT,
                  borderRadius: 1,
                  border: showWinHighlight ? '2px solid' : '1px dashed',
                  borderColor: showWinHighlight ? 'warning.main' : 'rgba(255,255,255,0.15)',
                  boxShadow: showWinHighlight
                    ? '0 0 16px rgba(245, 158, 11, 0.35)'
                    : 'none',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <Stack direction="row" spacing={1.5} sx={{ position: 'relative', zIndex: 0 }}>
                {displayReels.map((centre, index) => (
                  <SlotReel
                    key={index}
                    centreSymbol={centre}
                    topSymbol={reelFiller[index]!.top}
                    bottomSymbol={reelFiller[index]!.bottom}
                    spinning={isSpinning}
                    stopMs={REEL_STOP_MS[index]!}
                    spinId={spinId}
                    highlightPayline={showWinHighlight}
                  />
                ))}
              </Stack>
            </Box>

            {snapshot.phase === 'revealed' && snapshot.message && (
              <Alert
                severity={snapshot.multiplier > 0 ? 'success' : 'info'}
                sx={{ width: '100%' }}
              >
                {snapshot.message}
              </Alert>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: '100%', alignItems: { xs: 'stretch', sm: 'flex-end' } }}
            >
              <NumericInput
                label="Bet"
                value={betInput}
                onChange={handleBetChange}
                min={MIN_BET}
                step={MIN_BET}
                width={120}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => void handleSpin()}
                disabled={spinDisabled}
                sx={{ minWidth: 140, fontFamily: '"Fredoka", sans-serif' }}
              >
                {isSpinning ? 'Spinning…' : 'Spin'}
              </Button>
            </Stack>

            {insufficientBalance && (
              <Alert severity="warning" sx={{ width: '100%' }}>
                Not enough tadpoles — minimum bet is {MIN_BET}.
              </Alert>
            )}
          </Stack>
        </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(20, 31, 26, 0.4)',
            }}
          >
            <PayoutTable />
          </Paper>
        </Stack>
      </Stack>
    </Box>
  )
}
