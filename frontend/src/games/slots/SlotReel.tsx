import Box from '@mui/material/Box'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONFIG, spinReel } from './gameLogic'
import { SlotSymbolIcon } from './SlotSymbolIcon'
import type { SlotSymbol } from './types'

const SYMBOL_HEIGHT = 72
const STRIP_LENGTH = 18

function buildReelStrip(
  top: SlotSymbol,
  centre: SlotSymbol,
  bottom: SlotSymbol,
  spinId: number,
): SlotSymbol[] {
  const strip: SlotSymbol[] = []
  for (let i = 0; i < STRIP_LENGTH - 3; i += 1) {
    const seed = spinId * 31 + i * 17
    strip.push(
      spinReel(
        DEFAULT_CONFIG.symbols,
        DEFAULT_CONFIG.weights,
        () => ((seed * 9301 + 49297) % 233280) / 233280,
      ),
    )
  }
  strip.push(top, centre, bottom)
  return strip
}

export interface SlotReelProps {
  centreSymbol: SlotSymbol
  topSymbol: SlotSymbol
  bottomSymbol: SlotSymbol
  spinning: boolean
  stopMs: number
  spinId: number
  highlightPayline?: boolean
}

export function SlotReel({
  centreSymbol,
  topSymbol,
  bottomSymbol,
  spinning,
  stopMs,
  spinId,
  highlightPayline = false,
}: SlotReelProps) {
  const [offset, setOffset] = useState(0)
  const [animating, setAnimating] = useState(false)

  const strip = useMemo(
    () => buildReelStrip(topSymbol, centreSymbol, bottomSymbol, spinId),
    [topSymbol, centreSymbol, bottomSymbol, spinId],
  )

  const landingOffset = (strip.length - 3) * SYMBOL_HEIGHT

  useEffect(() => {
    if (!spinning) {
      setAnimating(false)
      setOffset(0)
      return
    }

    setAnimating(false)
    setOffset(0)

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnimating(true)
        setOffset(landingOffset)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [spinning, spinId, landingOffset])

  const staticSymbols: [SlotSymbol, SlotSymbol, SlotSymbol] = [
    topSymbol,
    centreSymbol,
    bottomSymbol,
  ]

  return (
    <Box
      sx={{
        width: 88,
        height: SYMBOL_HEIGHT * 3,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '2px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(8, 14, 12, 0.85)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {spinning ? (
        <Box
          sx={{
            transform: `translateY(-${offset}px)`,
            transition: animating
              ? `transform ${stopMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
              : 'none',
          }}
        >
          {strip.map((symbol, index) => (
            <Box
              key={`${spinId}-${index}`}
              sx={{
                height: SYMBOL_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              <SlotSymbolIcon symbol={symbol} />
            </Box>
          ))}
        </Box>
      ) : (
        staticSymbols.map((symbol, index) => (
          <Box
            key={symbol + index}
            sx={{
              height: SYMBOL_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              lineHeight: 1,
              userSelect: 'none',
              ...(index === 1 && highlightPayline
                ? {
                    bgcolor: 'rgba(245, 158, 11, 0.18)',
                    boxShadow: 'inset 0 0 0 2px rgba(245, 158, 11, 0.65)',
                  }
                : {}),
            }}
          >
            <SlotSymbolIcon symbol={symbol} />
          </Box>
        ))
      )}
    </Box>
  )
}

export function randomFillerSymbol(): SlotSymbol {
  return spinReel(DEFAULT_CONFIG.symbols, DEFAULT_CONFIG.weights)
}

export { SYMBOL_HEIGHT }
