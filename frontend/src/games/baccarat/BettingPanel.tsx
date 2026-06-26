import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { NumericInput } from '../../components/NumericInput'
import { BET_STEP, BET_TYPE_LABELS, MIN_BET } from './constants'
import type { BaccaratBetType, BaccaratSnapshot } from './types'

interface BettingPanelProps {
  snapshot: BaccaratSnapshot
  betInput: string
  onBetTypeChange: (betType: BaccaratBetType) => void
  onBetInputChange: (value: string) => void
  onBetInputBlur: () => void
  onDeal: () => void
  dealDisabled: boolean
  dealLabel: string
}

const BET_TYPES: BaccaratBetType[] = ['player', 'banker', 'tie']

export function BettingPanel({
  snapshot,
  betInput,
  onBetTypeChange,
  onBetInputChange,
  onBetInputBlur,
  onDeal,
  dealDisabled,
  dealLabel,
}: BettingPanelProps) {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <ToggleButtonGroup
        exclusive
        value={snapshot.pendingBetType}
        onChange={(_event, value: BaccaratBetType | null) => {
          if (value) onBetTypeChange(value)
        }}
        fullWidth
        size="small"
      >
        {BET_TYPES.map((betType) => (
          <ToggleButton key={betType} value={betType} sx={{ flex: 1, py: 1 }}>
            {BET_TYPE_LABELS[betType]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
        <NumericInput
          label="Bet"
          value={betInput}
          onChange={onBetInputChange}
          onBlur={onBetInputBlur}
          min={MIN_BET}
          step={BET_STEP}
        />
        <Button variant="contained" disabled={dealDisabled} onClick={onDeal}>
          {dealLabel}
        </Button>
      </Stack>

      {dealDisabled && snapshot.pendingBet >= MIN_BET && (
        <Typography variant="caption" color="text.secondary">
          Minimum bet is {MIN_BET} tadpoles.
        </Typography>
      )}
    </Stack>
  )
}
