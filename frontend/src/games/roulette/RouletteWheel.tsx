import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { WHEEL_SPIN_MS } from './constants'
import { landingRotation, POCKET_ANGLE, pocketFill, WHEEL_ORDER } from './wheelLayout'

const VIEW_SIZE = 240
const CX = VIEW_SIZE / 2
const CY = VIEW_SIZE / 2
const OUTER_R = 112
const INNER_R = 36
const LABEL_R = 82

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  }
}

function segmentPath(index: number): string {
  const start = index * POCKET_ANGLE
  const end = (index + 1) * POCKET_ANGLE
  const outerStart = polarToCartesian(start, OUTER_R)
  const outerEnd = polarToCartesian(end, OUTER_R)
  const innerStart = polarToCartesian(start, INNER_R)
  const innerEnd = polarToCartesian(end, INNER_R)
  const largeArc = POCKET_ANGLE > 180 ? 1 : 0

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

interface RouletteWheelProps {
  winningPocket: number
  size?: number
}

export function RouletteWheel({ winningPocket, size }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setRotation(0)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setRotation(landingRotation(winningPocket))
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [winningPocket])

  const pointerSize = size != null ? Math.max(10, size * 0.075) : undefined

  return (
    <Box
      sx={{
        position: 'relative',
        width: size ?? '100%',
        height: size ?? 'auto',
        aspectRatio: size == null ? '1' : undefined,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '1%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '0.45em solid transparent',
          borderRight: '0.45em solid transparent',
          borderTop: '0.75em solid #fbbf24',
          fontSize: pointerSize ?? { xs: '14px', sm: '18px', md: '22px' },
          zIndex: 2,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <circle cx={CX} cy={CY} r={OUTER_R + 4} fill="#2a1810" />
          {WHEEL_ORDER.map((pocket, index) => {
            const mid = index * POCKET_ANGLE + POCKET_ANGLE / 2
            const label = polarToCartesian(mid, LABEL_R)
            return (
              <g key={pocket}>
                <path
                  d={segmentPath(index)}
                  fill={pocketFill(pocket)}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={0.5}
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="#fff"
                  fontSize={pocket >= 10 ? 9 : 10}
                  fontFamily="Fredoka, sans-serif"
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid}, ${label.x}, ${label.y})`}
                >
                  {pocket}
                </text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={INNER_R - 2} fill="#1a120c" stroke="#4a3528" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={10} fill="#fbbf24" />
        </svg>
      </Box>
    </Box>
  )
}
