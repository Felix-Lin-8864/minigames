export const HIDDEN_COLS = 3
export const VISIBLE_COLS = 13
/** Total logical columns including hidden buffers on each side. */
export const COLS = VISIBLE_COLS + HIDDEN_COLS * 2

export const VISIBLE_COL_MIN = HIDDEN_COLS
export const VISIBLE_COL_MAX = HIDDEN_COLS + VISIBLE_COLS - 1

export const VIEWPORT_ROWS = 13
export const CELL_SIZE = 40
export const TILE_GAP = 3
export const TILE_RADIUS = 5

export const CANVAS_WIDTH = VISIBLE_COLS * CELL_SIZE
export const CANVAS_HEIGHT = VIEWPORT_ROWS * CELL_SIZE

/** Bottom row index (0 = bottom of screen). */
export const BOTTOM_ROW = 0

/** Top row index. */
export const TOP_ROW = VIEWPORT_ROWS - 1

/** Frog spawn row (0-indexed from bottom). */
export const FROG_START_ROW = 3

export const MOVEMENT_SCALE = 0.006
export const MOVE_COOLDOWN_MS = 280
export const MAX_FRAME_DELTA_MS = 32

export const MIN_LOG_WIDTH = 2
export const MAX_LOG_WIDTH = 4
export const MIN_VEHICLE_WIDTH = 1
export const MAX_VEHICLE_WIDTH = 3

export const COLORS = {
  tileGap: '#070d0b',
  tileBorder: 'rgba(74, 222, 128, 0.14)',
  grass: '#1a3329',
  grassAlt: '#152b22',
  grassLight: '#234a3a',
  grassLightAlt: '#1e4034',
  road: '#2a3544',
  roadAlt: '#243040',
  roadMark: '#4a5d73',
  river: '#1e4d6b',
  riverAlt: '#1a425c',
  riverShimmer: '#256685',
  goal: '#14532d',
  goalAlt: '#0f4226',
  lilypad: '#166534',
  lilypadAlt: '#14532d',
  lilypadLeaf: '#22c55e',
  frog: '#4ade80',
  frogDark: '#22c55e',
  car: '#f87171',
  carCab: '#ef4444',
  truck: '#fb923c',
  log: '#92400e',
  logLight: '#b45309',
  text: '#ecfdf5',
  life: '#4ade80',
  zoneDivider: 'rgba(74, 222, 128, 0.25)',
}

export {
  difficultyForWorldRow,
  getWorldRowInfo,
  isLilypadWorldRow,
  isRoadWorldRow,
  isRiverWorldRow,
  laneTypeForWorldRow,
  type LaneType,
} from './worldLayout'

/** Canvas y-offset: row 0 is the bottom of the screen. */
export function rowToCanvasY(row: number): number {
  return (VIEWPORT_ROWS - 1 - row) * CELL_SIZE + TILE_GAP / 2
}

/** Map a logical column to canvas x (only visible columns are drawn). */
export function logicalColToCanvasX(col: number): number {
  return (col - HIDDEN_COLS) * CELL_SIZE + TILE_GAP / 2
}

export function isLogicalColVisible(col: number): boolean {
  return col >= VISIBLE_COL_MIN && col <= VISIBLE_COL_MAX
}

export function logicalXToCanvasCenterX(x: number): number {
  return (x - HIDDEN_COLS) * CELL_SIZE + CELL_SIZE / 2
}
