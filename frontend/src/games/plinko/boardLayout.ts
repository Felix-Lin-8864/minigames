import { ROWS, SLOT_COUNT } from './constants'

export interface BoardPoint {
  x: number
  y: number
}

/** Vertical layout fractions within the board container (0 = top, 1 = bottom). */
const DROP_Y = 0.04
const FIRST_ROW_Y = 0.12
const LAST_ROW_Y = 0.78
const SLOT_Y = 0.92

function rowY(row: number): number {
  if (row <= 0) return DROP_Y
  if (row >= ROWS) return LAST_ROW_Y
  const t = (row - 1) / (ROWS - 1)
  return FIRST_ROW_Y + t * (LAST_ROW_Y - FIRST_ROW_Y)
}

/** Ball horizontal position after completing `row` (1–12). */
export function ballXAfterRow(row: number, position: number): number {
  const clampedPosition = Math.max(0, Math.min(row, position))
  return ((clampedPosition + 1) / (row + 2)) * 100
}

/** Drop origin — centred above the first peg row. */
export function dropStartPoint(): BoardPoint {
  return { x: 50, y: DROP_Y * 100 }
}

export function ballPointAfterRow(row: number, position: number): BoardPoint {
  return {
    x: ballXAfterRow(row, position),
    y: rowY(row) * 100,
  }
}

export function pegPoint(row: number, pegIndex: number): BoardPoint {
  const pegCount = row + 1
  return {
    x: ((pegIndex + 1) / (pegCount + 1)) * 100,
    y: rowY(row) * 100,
  }
}

export function slotPoint(slot: number): BoardPoint {
  return {
    x: ((slot + 0.5) / SLOT_COUNT) * 100,
    y: SLOT_Y * 100,
  }
}

export function allPegRows(): { row: number; pegs: BoardPoint[] }[] {
  return Array.from({ length: ROWS }, (_, index) => {
    const row = index + 1
    const pegCount = row + 1
    return {
      row,
      pegs: Array.from({ length: pegCount }, (_, pegIndex) => pegPoint(row, pegIndex)),
    }
  })
}

export function allSlotPoints(): BoardPoint[] {
  return Array.from({ length: SLOT_COUNT }, (_, slot) => slotPoint(slot))
}
