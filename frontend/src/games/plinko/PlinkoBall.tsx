import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ROW_MS } from './constants'
import { ballPointAfterRow, dropStartPoint, slotPoint } from './boardLayout'
import type { ActiveDrop } from './types'

const BALL_SIZE = 14
const PAYOUT_LABEL_MS = 1200

export interface PlinkoBallProps {
  drop: ActiveDrop
  onComplete: (id: number) => void
  onLand: (slot: number) => void
}

export function PlinkoBall({ drop, onComplete, onLand }: PlinkoBallProps) {
  const [animatedRow, setAnimatedRow] = useState(0)
  const [showPayoutLabel, setShowPayoutLabel] = useState(false)
  const [completed, setCompleted] = useState(false)
  const onCompleteRef = useRef(onComplete)
  const onLandRef = useRef(onLand)

  onCompleteRef.current = onComplete
  onLandRef.current = onLand

  useEffect(() => {
    setAnimatedRow(0)
    setShowPayoutLabel(false)
    setCompleted(false)

    let row = 0
    let completeTimer: number | undefined
    const timer = window.setInterval(() => {
      row += 1
      setAnimatedRow(row)
      if (row >= drop.path.length) {
        window.clearInterval(timer)
        setCompleted(true)
        onLandRef.current(drop.slot)
        if (drop.payout > 0) {
          setShowPayoutLabel(true)
          completeTimer = window.setTimeout(
            () => onCompleteRef.current(drop.id),
            PAYOUT_LABEL_MS,
          )
        } else {
          onCompleteRef.current(drop.id)
        }
      }
    }, ROW_MS)

    return () => {
      window.clearInterval(timer)
      if (completeTimer != null) window.clearTimeout(completeTimer)
    }
  }, [drop.id, drop.path, drop.slot, drop.payout])

  const ballPosition = useMemo(() => {
    if (drop.path.length === 0) return dropStartPoint()
    if (animatedRow <= 0) return dropStartPoint()
    if (completed) return ballPointAfterRow(drop.path.length, drop.path[drop.path.length - 1]!)
    const row = Math.min(animatedRow, drop.path.length)
    return ballPointAfterRow(row, drop.path[row - 1]!)
  }, [animatedRow, completed, drop.path])

  const labelPosition = slotPoint(drop.slot)

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: `${ballPosition.x}%`,
          top: `${ballPosition.y}%`,
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(74, 222, 128, 0.65)',
          transition: completed ? 'none' : 'left 90ms linear, top 90ms linear',
          zIndex: 2,
        }}
      />

      {showPayoutLabel && drop.payout > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: `${labelPosition.x}%`,
            top: `${labelPosition.y - 8}%`,
            transform: 'translate(-50%, -100%)',
            textAlign: 'center',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
            +{drop.payout}
          </Typography>
        </Box>
      )}
    </>
  )
}
