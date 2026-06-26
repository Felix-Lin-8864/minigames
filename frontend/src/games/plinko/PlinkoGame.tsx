import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { NumericInput } from '../../components/NumericInput'
import { FrogDollarIcon } from '../../components/icons/FrogDollarIcon'
import { formatTadpolesFixed, formatSignedTadpolesFixed } from '../../wallet/tadpoleAmount'
import {
  MIN_BET,
  MULTIPLIER_TABLE_GROUPS,
  MULTIPLIERS,
  RISK_TIER_LABELS,
} from './constants'
import { PlinkoBoard } from './PlinkoBoard'
import type { RiskTier } from './types'
import { usePlinkoGame } from './usePlinkoGame'

const RISK_TIERS: RiskTier[] = ['low', 'medium', 'high']

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

function MultiplierTable({ risk }: { risk: RiskTier }) {
  const multipliers = MULTIPLIERS[risk]

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="overline" color="text.secondary">
        {RISK_TIER_LABELS[risk]} risk payouts
      </Typography>
      {MULTIPLIER_TABLE_GROUPS.map(({ slots, slotLabel }) => (
        <Stack
          key={slotLabel}
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="body2">Slots {slotLabel}</Typography>
          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {multipliers[slots[0]!]}×
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

function resolveStatusBanner(
  sessionNet: number,
  activeDropCount: number,
  insufficientBalance: boolean,
): { severity: 'success' | 'info' | 'warning'; message: string } {
  if (insufficientBalance) {
    return {
      severity: 'warning',
      message: `Not enough tadpoles for this bet — minimum bet is ${MIN_BET}.`,
    }
  }

  let message = `Session net: ${formatSignedTadpolesFixed(sessionNet)} tadpoles`
  if (activeDropCount > 0) {
    const ballsLabel =
      activeDropCount === 1 ? '1 ball in play' : `${activeDropCount} balls in play`
    message = `${message} · ${ballsLabel}`
  }

  const severity = sessionNet > 0 ? 'success' : sessionNet < 0 ? 'info' : 'info'
  return { severity, message }
}

export function PlinkoGame() {
  const { snapshot, wallet, setBet, setRisk, drop, completeDrop, activeDropCount } =
    usePlinkoGame()
  const [betInput, setBetInput] = useState(String(MIN_BET))

  const handleDropComplete = useCallback(
    (id: number) => {
      void completeDrop(id)
    },
    [completeDrop],
  )

  async function handleDrop() {
    const bet = parseBetInput(betInput)
    if (bet === null) return
    await drop(bet, snapshot.risk)
  }

  function handleBetChange(value: string) {
    setBetInput(value)
    const bet = parseBetInput(value)
    if (bet !== null) {
      setBet(bet)
    }
  }

  const parsedBet = parseBetInput(betInput)
  const betTooLow = parsedBet === null
  const insufficientBalance = parsedBet !== null && wallet.balance < parsedBet
  const dropDisabled = betTooLow || insufficientBalance
  const statusBanner = resolveStatusBanner(
    snapshot.sessionNet,
    activeDropCount,
    insufficientBalance,
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'center', lg: 'flex-start' }, justifyContent: 'center' }}
      >
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 560, alignItems: 'center' }}>
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
            <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={snapshot.risk}
                onChange={(_, value: RiskTier | null) => {
                  if (value != null) setRisk(value)
                }}
              >
                {RISK_TIERS.map((tier) => (
                  <ToggleButton key={tier} value={tier}>
                    {RISK_TIER_LABELS[tier]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <PlinkoBoard
                displayRisk={snapshot.risk}
                activeDrops={snapshot.activeDrops}
                onDropComplete={handleDropComplete}
              />

              <Alert
                severity={statusBanner.severity}
                sx={{
                  width: '100%',
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                {statusBanner.message}
              </Alert>

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
                  step={1}
                  width={120}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => void handleDrop()}
                  disabled={dropDisabled}
                  sx={{ minWidth: 140, fontFamily: '"Fredoka", sans-serif' }}
                >
                  Drop
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            width: '100%',
            maxWidth: 280,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(20, 31, 26, 0.4)',
          }}
        >
          <MultiplierTable risk={snapshot.risk} />
        </Paper>
      </Stack>
    </Box>
  )
}
