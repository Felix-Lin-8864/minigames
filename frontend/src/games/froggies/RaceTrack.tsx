import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  CELL_SIZE_PX,
  FINISH_POSITION,
  FROG_COLOURS,
  FROG_LABELS,
  FROGS,
  TRACK_SQUARES,
} from './constants'
import type { FrogPositions } from './types'

const trackScrollSx = {
  width: '100%',
  overflowX: 'auto',
  pb: 0.5,
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(74, 222, 128, 0.4) transparent',
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(74, 222, 128, 0.35)',
    borderRadius: 4,
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(74, 222, 128, 0.55)',
  },
} as const

interface RaceTrackProps {
  tickHistory: FrogPositions[] | null
  animationTick: number
}

function getPositionsAtTick(
  tickHistory: FrogPositions[] | null,
  animationTick: number,
): FrogPositions | null {
  if (!tickHistory || tickHistory.length === 0) return null
  const index = Math.min(animationTick, tickHistory.length - 1)
  return tickHistory[index] ?? null
}

function cellState(
  column: number,
  position: number,
): 'blank' | 'trail' | 'frog' {
  if (column === 0) return 'frog'
  if (column > position) return 'blank'
  if (column === position) return 'frog'
  return 'trail'
}

export function RaceTrack({ tickHistory, animationTick }: RaceTrackProps) {
  const positions = getPositionsAtTick(tickHistory, animationTick)

  return (
    <Box sx={trackScrollSx}>
      <Stack spacing="2px" sx={{ width: 'fit-content', minWidth: '100%', mx: 'auto' }}>
        {FROGS.map((frog) => {
          const position = positions
            ? Math.min(positions[frog], FINISH_POSITION)
            : 0

          return (
            <Stack key={frog} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  width: 52,
                  flexShrink: 0,
                  color: 'text.secondary',
                  fontFamily: '"Fredoka", sans-serif',
                }}
              >
                {FROG_LABELS[frog]}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TRACK_SQUARES}, ${CELL_SIZE_PX}px)`,
                  gap: '2px',
                }}
              >
                {Array.from({ length: TRACK_SQUARES }, (_, column) => {
                  const state = cellState(column, position)
                  const isFinish = column === FINISH_POSITION

                  return (
                    <Box
                      key={column}
                      sx={{
                        width: CELL_SIZE_PX,
                        height: CELL_SIZE_PX,
                        bgcolor:
                          state === 'frog' || state === 'trail'
                            ? FROG_COLOURS[frog]
                            : 'transparent',
                        opacity: state === 'trail' ? 0.35 : 1,
                        outline: '1px solid',
                        outlineColor:
                          isFinish && state === 'blank'
                            ? 'rgba(255,255,255,0.25)'
                            : 'rgba(255,255,255,0.12)',
                        outlineOffset: -1,
                      }}
                    />
                  )
                })}
              </Box>
            </Stack>
          )
        })}
      </Stack>
    </Box>
  )
}
