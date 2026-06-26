import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { NumericInput } from '../../components/NumericInput'
import { snapRequiredBetAmount } from '../betAmount'
import {
  BET_STEP,
  BET_TYPE_LABELS,
  BET_TYPES,
  FROG_COLOURS,
  FROG_LABELS,
  FROGS,
  MIN_BET,
  ORDINAL_LABELS,
} from './constants'
import { getSlotCount, getMultiplier, getWinProbability } from './raceLogic'
import type { BetType, FrogColour, FroggiesSnapshot } from './types'

interface BettingPanelProps {
  snapshot: FroggiesSnapshot
  walletBalance: number
  onBetTypeChange: (betType: BetType) => void
  onSlotChange: (index: number, frog: FrogColour | null) => void
  onBetAmountChange: (amount: number) => void
  onStartRace: () => void
}

function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(probability >= 0.01 ? 1 : 2)}%`
}

function FrogSwatch({ frog }: { frog: FrogColour }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: 0.5,
          bgcolor: FROG_COLOURS[frog],
          border: frog === 'yellow' ? '1px solid rgba(255,255,255,0.35)' : 'none',
        }}
      />
      <span>{FROG_LABELS[frog]}</span>
    </Stack>
  )
}

export function BettingPanel({
  snapshot,
  walletBalance,
  onBetTypeChange,
  onSlotChange,
  onBetAmountChange,
  onStartRace,
}: BettingPanelProps) {
  const [betInput, setBetInput] = useState(String(MIN_BET))
  const disabled = snapshot.phase !== 'betting'
  const slotCount = getSlotCount(snapshot.betType)
  const insufficientBalance = walletBalance < snapshot.betAmount
  const startDisabled =
    disabled ||
    !snapshot.canStartRace ||
    insufficientBalance

  function handleBetChange(value: string) {
    setBetInput(value)
    const trimmed = value.trim()
    if (trimmed === '') return
    const parsed = Math.floor(Number(trimmed))
    if (!Number.isFinite(parsed)) return
    if (parsed >= MIN_BET && parsed % BET_STEP === 0) {
      onBetAmountChange(parsed)
    }
  }

  function handleBetBlur() {
    const snapped = snapRequiredBetAmount(betInput, MIN_BET, BET_STEP)
    setBetInput(String(snapped))
    onBetAmountChange(snapped)
  }

  function availableFrogs(slotIndex: number): FrogColour[] {
    const used = new Set(
      snapshot.selection
        .slice(0, slotCount)
        .map((frog, index) => (index === slotIndex ? null : frog))
        .filter((frog): frog is FrogColour => frog !== null),
    )
    return FROGS.filter((frog) => !used.has(frog))
  }

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Typography variant="overline" color="text.secondary">
        Bet type
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={snapshot.betType}
        onChange={(_, value: BetType | null) => {
          if (value) onBetTypeChange(value)
        }}
        size="small"
        disabled={disabled}
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
      >
        {BET_TYPES.map((type) => (
          <ToggleButton
            key={type}
            value={type}
            sx={{
              fontFamily: '"Fredoka", sans-serif',
              textTransform: 'none',
              px: 1.5,
              py: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {BET_TYPE_LABELS[type]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getMultiplier(type)}× · {formatProbability(getWinProbability(type))}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Typography variant="overline" color="text.secondary">
        Your picks
      </Typography>
      <Stack spacing={1.5}>
        {Array.from({ length: slotCount }, (_, index) => (
          <FormControl key={index} size="small" fullWidth disabled={disabled}>
            <InputLabel id={`froggies-slot-${index}`}>{ORDINAL_LABELS[index]}</InputLabel>
            <Select<FrogColour | ''>
              labelId={`froggies-slot-${index}`}
              label={ORDINAL_LABELS[index]}
              value={(snapshot.selection[index] ?? '') as FrogColour | ''}
              onChange={(event) => {
                const value = event.target.value as FrogColour | ''
                onSlotChange(index, value === '' ? null : value)
              }}
              renderValue={(value: FrogColour | '') =>
                value !== '' ? <FrogSwatch frog={value} /> : 'Select frog'
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableFrogs(index).map((frog) => (
                <MenuItem key={frog} value={frog}>
                  <FrogSwatch frog={frog} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <NumericInput
          label="Bet"
          value={betInput}
          onChange={handleBetChange}
          onBlur={handleBetBlur}
          min={MIN_BET}
          step={BET_STEP}
          width={120}
        />
        <Button
          variant="contained"
          size="large"
          onClick={onStartRace}
          disabled={startDisabled}
          sx={{ minWidth: 140, fontFamily: '"Fredoka", sans-serif' }}
        >
          Start Race
        </Button>
      </Stack>

      {insufficientBalance && snapshot.phase === 'betting' && (
        <Typography variant="body2" color="warning.main">
          Not enough tadpoles — minimum bet is {MIN_BET}.
        </Typography>
      )}
    </Stack>
  )
}
