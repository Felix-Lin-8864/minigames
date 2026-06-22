import Box from '@mui/material/Box'
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import { SYMBOL_EMOJI } from './symbols'
import type { SlotSymbol } from './types'

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif'

function FlyIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="13" rx="2.2" ry="4.5" fill="currentColor" />
      <ellipse cx="7.5" cy="10" rx="4.5" ry="2.8" fill="currentColor" opacity="0.85" />
      <ellipse cx="16.5" cy="10" rx="4.5" ry="2.8" fill="currentColor" opacity="0.85" />
      <circle cx="11.2" cy="9.5" r="1.1" fill="#0a1210" />
      <circle cx="13.2" cy="9.5" r="1.1" fill="#0a1210" />
      <circle cx="11.5" cy="9.2" r="0.35" fill="#ecfdf5" />
      <circle cx="13.5" cy="9.2" r="0.35" fill="#ecfdf5" />
    </SvgIcon>
  )
}

export interface SlotSymbolIconProps {
  symbol: SlotSymbol
  size?: number | string
}

export function SlotSymbolIcon({ symbol, size = '2.5rem' }: SlotSymbolIconProps) {
  if (symbol === 'fly') {
    return (
      <FlyIcon
        sx={{
          fontSize: size,
          color: 'text.primary',
        }}
      />
    )
  }

  return (
    <Box
      component="span"
      sx={{
        fontSize: size,
        lineHeight: 1,
        fontFamily: EMOJI_FONT,
      }}
      aria-hidden
    >
      {SYMBOL_EMOJI[symbol]}
    </Box>
  )
}
