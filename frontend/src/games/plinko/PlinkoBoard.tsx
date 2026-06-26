import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import {
  MULTIPLIERS,
  SLOT_COLOR_VALUES,
  slotColorTier,
} from './constants'
import { allPegRows, allSlotPoints } from './boardLayout'
import { PlinkoBall } from './PlinkoBall'
import type { ActiveDrop, RiskTier } from './types'

const PEG_SIZE = 8
const SLOT_FLASH_MS = 400

export interface PlinkoBoardProps {
  displayRisk: RiskTier
  activeDrops: ActiveDrop[]
  onDropComplete: (id: number) => void
}

export function PlinkoBoard({ displayRisk, activeDrops, onDropComplete }: PlinkoBoardProps) {
  const pegRows = useMemo(() => allPegRows(), [])
  const slotPoints = useMemo(() => allSlotPoints(), [])
  const multipliers = MULTIPLIERS[displayRisk]
  const [flashingSlots, setFlashingSlots] = useState<Record<number, number>>({})

  const handleLand = useCallback((slot: number) => {
    setFlashingSlots((prev) => ({ ...prev, [slot]: Date.now() }))
    window.setTimeout(() => {
      setFlashingSlots((prev) => {
        if (!(slot in prev)) return prev
        const next = { ...prev }
        delete next[slot]
        return next
      })
    }, SLOT_FLASH_MS)
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        aspectRatio: '5 / 6',
        mx: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(8, 16, 12, 0.75)',
        overflow: 'hidden',
      }}
    >
      {pegRows.map(({ row, pegs }) =>
        pegs.map((peg, pegIndex) => (
          <Box
            key={`peg-${row}-${pegIndex}`}
            sx={{
              position: 'absolute',
              left: `${peg.x}%`,
              top: `${peg.y}%`,
              width: PEG_SIZE,
              height: PEG_SIZE,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.85)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 6px rgba(255,255,255,0.25)',
            }}
          />
        )),
      )}

      {slotPoints.map((point, slotIndex) => {
        const slotMultiplier = multipliers[slotIndex]!
        const colorTier = slotColorTier(slotMultiplier)
        const isFlashing = slotIndex in flashingSlots

        return (
          <Box
            key={`slot-${slotIndex}`}
            sx={{
              position: 'absolute',
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${100 / 13 - 0.5}%`,
              minWidth: 28,
              transform: 'translate(-50%, -50%)',
              borderRadius: 1,
              py: 0.5,
              px: 0.25,
              textAlign: 'center',
              bgcolor: isFlashing ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
              border: '2px solid',
              borderColor: isFlashing ? 'warning.main' : SLOT_COLOR_VALUES[colorTier],
              boxShadow: isFlashing ? '0 0 14px rgba(245, 158, 11, 0.45)' : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '0.62rem',
                color: 'text.secondary',
                lineHeight: 1.1,
              }}
            >
              {slotIndex}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.68rem',
                color: SLOT_COLOR_VALUES[colorTier],
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.2,
              }}
            >
              {slotMultiplier}×
            </Typography>
          </Box>
        )
      })}

      {activeDrops.map((drop) => (
        <PlinkoBall
          key={drop.id}
          drop={drop}
          onComplete={onDropComplete}
          onLand={handleLand}
        />
      ))}
    </Box>
  )
}
