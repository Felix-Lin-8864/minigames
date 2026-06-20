import Box from '@mui/material/Box'
import type { CSSProperties, ReactNode } from 'react'
import {
  betZoneKey,
  createInsideBet,
  createOutsideBet,
  isOutsideBetType,
  type Bet,
  type BetType,
} from './bets'
import { GRID, GRID_ROWS } from './grid'
import { NUMBER_DATA } from './numberData'
import { pocketColorSx } from './RecentSpins'
import type { GamePhase } from './types'

const CELL = 40
const ZERO_W = 44
const COL_BET_W = 44
const STREET_W = 20

interface BettingTableProps {
  pendingBets: Bet[]
  selectedChip: number
  phase: GamePhase
  spinResult: number | null
  boostedPocket: number | null
  onPlaceBet: (bet: Bet) => void
}

function chipTotalsByZone(bets: Bet[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const bet of bets) {
    const key = betZoneKey(bet)
    map.set(key, (map.get(key) ?? 0) + bet.amount)
  }
  return map
}

function ChipMarker({ amount }: { amount: number }) {
  if (amount <= 0) return null
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        minWidth: 26,
        height: 26,
        borderRadius: '50%',
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        border: '2px solid',
        borderColor: 'warning.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: '"Fredoka", sans-serif',
        pointerEvents: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      {amount}
    </Box>
  )
}

function PocketCell({
  number,
  onClick,
  chipAmount,
  highlighted,
  disabled,
  fullHeight,
  boosted,
}: {
  number: number
  onClick: () => void
  chipAmount: number
  highlighted: boolean
  disabled: boolean
  fullHeight?: boolean
  boosted?: boolean
}) {
  const data = NUMBER_DATA[number]!
  const pocketSx = boosted
    ? { bgcolor: '#fbbf24', color: '#1a120c' }
    : pocketColorSx(data.color)

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        position: 'relative',
        width: fullHeight ? ZERO_W : CELL,
        height: fullHeight ? '100%' : CELL,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        border: '1px solid rgba(255,255,255,0.15)',
        outline: highlighted ? '2px solid #fbbf24' : 'none',
        outlineOffset: -2,
        fontFamily: '"Fredoka", sans-serif',
        fontWeight: 600,
        fontSize: '0.85rem',
        userSelect: 'none',
        '&:hover': disabled ? {} : { filter: 'brightness(1.15)' },
        ...pocketSx,
      }}
    >
      {number}
      <ChipMarker amount={chipAmount} />
    </Box>
  )
}

function OutsideCell({
  label,
  onClick,
  chipAmount,
  disabled,
  sx,
}: {
  label: string
  onClick: () => void
  chipAmount: number
  disabled: boolean
  sx?: object
}) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        border: '1px solid rgba(255,255,255,0.15)',
        bgcolor: 'rgba(30, 45, 38, 0.9)',
        fontFamily: '"Fredoka", sans-serif',
        fontWeight: 600,
        fontSize: '0.7rem',
        textAlign: 'center',
        px: 0.5,
        userSelect: 'none',
        '&:hover': disabled ? {} : { bgcolor: 'rgba(50, 70, 58, 0.95)' },
        ...sx,
      }}
    >
      {label}
      <ChipMarker amount={chipAmount} />
    </Box>
  )
}

function SplitZone({
  onClick,
  disabled,
  vertical,
  style,
}: {
  onClick: () => void
  disabled: boolean
  vertical?: boolean
  style: CSSProperties
}) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        position: 'absolute',
        zIndex: 3,
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: 'transparent',
        '&:hover': disabled ? {} : { bgcolor: 'rgba(251, 191, 36, 0.25)' },
        ...(vertical
          ? { width: 8, marginLeft: -4 }
          : { height: 8, marginTop: -4 }),
      }}
      style={style}
    />
  )
}

export function BettingTable({
  pendingBets,
  selectedChip,
  phase,
  spinResult,
  boostedPocket,
  onPlaceBet,
}: BettingTableProps) {
  const disabled = phase === 'revealing'
  const chips = chipTotalsByZone(pendingBets)

  function zoneAmount(type: BetType, numbers: number[]): number {
    if (numbers.length === 0 && isOutsideBetType(type)) {
      return chips.get(betZoneKey(createOutsideBet(type, 0))) ?? 0
    }
    return chips.get(`${type}:${[...numbers].sort((a, b) => a - b).join('-')}`) ?? 0
  }

  function placeInside(type: BetType, numbers: number[]) {
    const bet = createInsideBet(type, numbers, selectedChip)
    if (bet) onPlaceBet(bet)
  }

  function placeOutside(type: BetType) {
    onPlaceBet(createOutsideBet(type, selectedChip))
  }

  const numberBlockWidth = 3 * CELL + STREET_W

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', minWidth: 'min-content' }}>
        {/* Number block + column bets */}
        <Box sx={{ display: 'flex' }}>
          {/* Zero */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              '& > div': { height: GRID_ROWS * CELL, width: ZERO_W },
            }}
          >
            <PocketCell
              number={0}
              onClick={() => placeInside('straight', [0])}
              chipAmount={zoneAmount('straight', [0])}
              highlighted={spinResult === 0}
              disabled={disabled}
              fullHeight
              boosted={boostedPocket === 0}
            />
          </Box>

          {/* 3x12 grid + street zones */}
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex' }}>
              <Box>
                {GRID.slice()
                  .reverse()
                  .map((row, rowIdx) => {
                    const actualRow = GRID_ROWS - rowIdx
                    return (
                      <Box key={actualRow} sx={{ display: 'flex' }}>
                        {row.map((n) => (
                          <PocketCell
                            key={n}
                            number={n}
                            onClick={() => placeInside('straight', [n])}
                            chipAmount={zoneAmount('straight', [n])}
                            highlighted={spinResult === n}
                            disabled={disabled}
                            boosted={boostedPocket === n}
                          />
                        ))}
                      </Box>
                    )
                  })}
              </Box>
              {/* Street bets (right of each row) */}
              <Box>
                {GRID.slice()
                  .reverse()
                  .map((row) => (
                    <OutsideCell
                      key={`street-${row.join('-')}`}
                      label=""
                      onClick={() => placeInside('street', row)}
                      chipAmount={zoneAmount('street', row)}
                      disabled={disabled}
                      sx={{ width: STREET_W, height: CELL }}
                    />
                  ))}
              </Box>
            </Box>

            {/* Split overlays */}
            {GRID.slice()
              .reverse()
              .map((row, rowIdx) => {
                const top = rowIdx * CELL
                return row.map((n, colIdx) => {
                  const left = colIdx * CELL
                  const zones: ReactNode[] = []

                  if (colIdx < 2) {
                    const right = row[colIdx + 1]!
                    zones.push(
                      <SplitZone
                        key={`h-${n}-${right}`}
                        onClick={() => placeInside('split', [n, right])}
                        disabled={disabled}
                        style={{ left: left + CELL - 4, top, width: 8, height: CELL }}
                      />,
                    )
                  }

                  if (rowIdx < GRID_ROWS - 1) {
                    const rowBelow = GRID[GRID_ROWS - rowIdx - 2]!
                    const below = rowBelow[colIdx]!
                    zones.push(
                      <SplitZone
                        key={`v-${n}-${below}`}
                        onClick={() => placeInside('split', [n, below])}
                        disabled={disabled}
                        vertical
                        style={{ left, top: top + CELL - 4, height: 8, width: CELL }}
                      />,
                    )
                  }

                  if (colIdx < 2 && rowIdx < GRID_ROWS - 1) {
                    const rowBelow = GRID[GRID_ROWS - rowIdx - 2]!
                    const corner = [n, row[colIdx + 1]!, rowBelow[colIdx]!, rowBelow[colIdx + 1]!]
                    zones.push(
                      <SplitZone
                        key={`c-${corner.join('-')}`}
                        onClick={() => placeInside('corner', corner)}
                        disabled={disabled}
                        style={{
                          left: left + CELL - 6,
                          top: top + CELL - 6,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                        }}
                      />,
                    )
                  }

                  return zones
                })
              })}

            {/* Six-line zones between rows */}
            {Array.from({ length: GRID_ROWS - 1 }, (_, i) => {
              const rowAbove = GRID[GRID_ROWS - i - 2]!
              const rowBelow = GRID[GRID_ROWS - i - 1]!
              const numbers = [...rowAbove, ...rowBelow]
              const top = (i + 1) * CELL - 4
              return (
                <SplitZone
                  key={`six-${numbers.join('-')}`}
                  onClick={() => placeInside('sixline', numbers)}
                  disabled={disabled}
                  style={{ left: 0, top, width: 3 * CELL, height: 8 }}
                />
              )
            })}

            {/* 0 splits */}
            <SplitZone
              onClick={() => placeInside('split', [0, 1])}
              disabled={disabled}
              style={{ left: -4, top: (GRID_ROWS - 1) * CELL, width: 8, height: CELL }}
            />
            <SplitZone
              onClick={() => placeInside('split', [0, 2])}
              disabled={disabled}
              style={{ left: -4, top: (GRID_ROWS - 2) * CELL + CELL / 2 - 4, width: 8, height: 8 }}
            />
            <SplitZone
              onClick={() => placeInside('split', [0, 3])}
              disabled={disabled}
              style={{ left: -4, top: 0, width: 8, height: CELL }}
            />
          </Box>

          {/* Column bets */}
          <Box>
            {(['column3', 'column2', 'column1'] as const).map((col) => (
              <OutsideCell
                key={col}
                label="2:1"
                onClick={() => placeOutside(col)}
                chipAmount={zoneAmount(col, [])}
                disabled={disabled}
                sx={{ width: COL_BET_W, height: CELL * 4 }}
              />
            ))}
          </Box>
        </Box>

        {/* Dozens */}
        <Box sx={{ display: 'flex', ml: `${ZERO_W}px` }}>
          {(['dozen1', 'dozen2', 'dozen3'] as const).map((dozen) => (
            <OutsideCell
              key={dozen}
              label={dozen === 'dozen1' ? '1st 12' : dozen === 'dozen2' ? '2nd 12' : '3rd 12'}
              onClick={() => placeOutside(dozen)}
              chipAmount={zoneAmount(dozen, [])}
              disabled={disabled}
              sx={{ width: numberBlockWidth / 3, height: 36 }}
            />
          ))}
          <Box sx={{ width: COL_BET_W }} />
        </Box>

        {/* Even-money outside bets */}
        <Box sx={{ display: 'flex', ml: `${ZERO_W}px` }}>
          {(
            [
              { type: 'low' as const, label: '1–18' },
              { type: 'even' as const, label: 'Even' },
              { type: 'red' as const, label: 'Red' },
              { type: 'black' as const, label: 'Black' },
              { type: 'odd' as const, label: 'Odd' },
              { type: 'high' as const, label: '19–36' },
            ] as const
          ).map(({ type, label }) => (
            <OutsideCell
              key={type}
              label={label}
              onClick={() => placeOutside(type)}
              chipAmount={zoneAmount(type, [])}
              disabled={disabled}
              sx={{
                width: numberBlockWidth / 6,
                height: 36,
                ...(type === 'red' || type === 'black'
                  ? pocketColorSx(type === 'red' ? 'red' : 'black')
                  : {}),
              }}
            />
          ))}
          <Box sx={{ width: COL_BET_W }} />
        </Box>
      </Box>
    </Box>
  )
}
