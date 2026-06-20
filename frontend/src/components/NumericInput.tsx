import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

const hideNumberSpinners = {
  MozAppearance: 'textfield',
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
} as const

const stepperButtonSx = {
  borderRadius: 0,
  flex: 1,
  minHeight: 0,
  py: 0,
  px: 0.5,
  width: 32,
} as const

export interface NumericInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  width?: number
  placeholder?: string
  id?: string
}

function parseValue(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const n = Math.floor(Number(trimmed))
  if (!Number.isFinite(n)) return null
  return n
}

export function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  width = 120,
  placeholder,
  id,
}: NumericInputProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  function applyDelta(delta: number) {
    const current = parseValue(value) ?? (min ?? 0)
    let next = current + delta
    if (min != null) next = Math.max(min, next)
    if (max != null) next = Math.min(max, next)
    onChange(String(next))
  }

  return (
    <Stack spacing={0.5} sx={{ width }}>
      <InputLabel htmlFor={fieldId} shrink sx={{ position: 'relative', transform: 'none', mb: 0.25 }}>
        {label}
      </InputLabel>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'rgba(0, 0, 0, 0.15)',
          '&:focus-within': {
            borderColor: 'primary.main',
            outline: '1px solid',
            outlineColor: 'primary.main',
          },
        }}
      >
        <TextField
          id={fieldId}
          type="number"
          size="small"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          variant="standard"
          slotProps={{
            htmlInput: { min, max, step, 'aria-label': label },
            input: { disableUnderline: true },
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiInput-root': { px: 1.5, py: 0.75 },
            '& input': hideNumberSpinners,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={() => applyDelta(step)}
            aria-label={`Increase ${label}`}
            sx={{ ...stepperButtonSx, borderBottom: 1, borderColor: 'divider' }}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => applyDelta(-step)}
            aria-label={`Decrease ${label}`}
            disabled={min != null && (parseValue(value) ?? min) <= min}
            sx={stepperButtonSx}
          >
            <KeyboardArrowDownIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Stack>
  )
}
