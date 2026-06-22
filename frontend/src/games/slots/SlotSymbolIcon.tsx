import { SLOT_SYMBOL_COLORS, SLOT_SYMBOL_ICONS } from './slotSymbolIcons'
import type { SlotSymbol } from './types'

export interface SlotSymbolIconProps {
  symbol: SlotSymbol
  size?: number | string
}

export function SlotSymbolIcon({ symbol, size = '2.5rem' }: SlotSymbolIconProps) {
  const Icon = SLOT_SYMBOL_ICONS[symbol]
  const color = SLOT_SYMBOL_COLORS[symbol]

  return (
    <Icon
      aria-hidden
      sx={{
        fontSize: size,
        color: color ?? 'text.primary',
      }}
    />
  )
}
