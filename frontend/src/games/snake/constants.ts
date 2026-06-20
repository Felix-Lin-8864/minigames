export const GRID_COLS = 20
export const GRID_ROWS = 20
export const CELL_SIZE = 24
export const CELL_GAP = 1
export const CELL_RADIUS = 4

export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE

export const INITIAL_TICK_MS = 140
export const MIN_TICK_MS = 75
export const TICK_SPEEDUP_MS = 3

export const MIN_SNAKE_LENGTH = 3
export const SHRINK_SEGMENTS = 2
export const NORMAL_FOOD_POINTS = 1
export const GOLDEN_FOOD_POINTS = 3
export const WALL_SCORE_INTERVAL = 10
export const MIN_MAP_WALLS = 10
export const MAX_MAP_WALLS = 20
export const MAX_PELLETS = 5
export const RED_PELLET_MIN_SCORE = 10
export const RED_WALL_BREAKS = 1

export const COLORS = {
  background: '#0a1210',
  grid: 'rgba(74, 222, 128, 0.06)',
  snakeHead: '#4ade80',
  snakeBody: '#22c55e',
  snakeBodyAlt: '#16a34a',
  snakeHeadRed: '#f87171',
  snakeBodyRed: '#ef4444',
  snakeBodyRedAlt: '#dc2626',
  snakeEye: '#0a1410',
  pelletNormal: '#86efac',
  pelletNormalGlow: 'rgba(134, 239, 172, 0.3)',
  pelletGolden: '#fbbf24',
  pelletGoldenGlow: 'rgba(251, 191, 36, 0.4)',
  pelletShrink: '#c084fc',
  pelletShrinkGlow: 'rgba(192, 132, 252, 0.35)',
  pelletRed: '#ef4444',
  pelletRedGlow: 'rgba(239, 68, 68, 0.45)',
  mapWall: '#3d5248',
  mapWallBorder: '#4a6358',
}
