import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import type { SxProps, Theme } from '@mui/material/styles'
import type { PointerEvent, ReactNode } from 'react'

interface DirectionalPadProps {
  onUp: () => void
  onDown: () => void
  onLeft: () => void
  onRight: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

const buttonSx = {
  minWidth: 48,
  minHeight: 48,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  '&:active': {
    bgcolor: 'action.selected',
  },
}

function PadButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!disabled) onPress()
  }

  const icons: Record<string, ReactNode> = {
    Up: <KeyboardArrowUpIcon />,
    Down: <KeyboardArrowDownIcon />,
    Left: <KeyboardArrowLeftIcon />,
    Right: <KeyboardArrowRightIcon />,
  }

  return (
    <IconButton
      aria-label={label}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      sx={buttonSx}
    >
      {icons[label]}
    </IconButton>
  )
}

export function DirectionalPad({ onUp, onDown, onLeft, onRight, disabled, sx }: DirectionalPadProps) {
  return (
    <Box
      role="group"
      aria-label="Directional pad"
      sx={[
        {
          display: { xs: 'grid', md: 'none' },
          touchAction: 'none',
          userSelect: 'none',
          gridTemplateColumns: 'repeat(3, 48px)',
          gridTemplateRows: 'repeat(3, 48px)',
          gap: 0.5,
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box />
      <PadButton label="Up" onPress={onUp} disabled={disabled} />
      <Box />
      <PadButton label="Left" onPress={onLeft} disabled={disabled} />
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: 'rgba(74, 222, 128, 0.06)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
      <PadButton label="Right" onPress={onRight} disabled={disabled} />
      <Box />
      <PadButton label="Down" onPress={onDown} disabled={disabled} />
      <Box />
    </Box>
  )
}
