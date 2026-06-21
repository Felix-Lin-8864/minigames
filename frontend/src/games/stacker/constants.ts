export const PLAY_WIDTH = 400
export const LAYER_HEIGHT = 28
export const BASE_LAYER_WIDTH = PLAY_WIDTH * 0.75 * 0.7
export const BASE_SPEED = 0.28
export const GRID_CELL_SIZE = 20
export const SPEED_STEP_LAYERS = 5
export const SPEED_MULTIPLIER = 1.05
export const MIN_LAYER_WIDTH = 4
export const VISIBLE_HEIGHT = 420
export const ROWS_ABOVE_ACTIVE = 4
export const GAP_ROWS_ABOVE_STACK = 1
export const CANVAS_WIDTH = PLAY_WIDTH
export const CANVAS_HEIGHT = VISIBLE_HEIGHT
export const MAX_FRAME_DELTA_MS = 32
export const TRIM_FALL_DURATION_MS = 400
export const PERFECT_FLASH_DURATION_MS = 350

export const COLORS = {
  background: '#0a1210',
  grid: 'rgba(74, 222, 128, 0.06)',
  platform: '#1a3329',
  lilypad: '#166534',
  lilypadAlt: '#14532d',
  lilypadLeaf: '#22c55e',
  lilypadActive: '#4ade80',
  lilypadPerfect: '#fbbf24',
  trimPiece: '#15803d',
  ripple: 'rgba(74, 222, 128, 0.5)',
  text: '#ecfdf5',
}

export function speedForSuccessfulLayers(successfulLayers: number, baseSpeed = BASE_SPEED): number {
  const steps = Math.floor(successfulLayers / SPEED_STEP_LAYERS)
  return baseSpeed * Math.pow(SPEED_MULTIPLIER, steps)
}

export function activeLayerBounds(width: number): { min: number; max: number } {
  const half = width / 2
  const limit = PLAY_WIDTH / 2 - half
  return { min: -limit, max: limit }
}

export function scrollOffsetForLayerCount(layerCount: number): number {
  const activeYUnscrolled =
    CANVAS_HEIGHT - (layerCount + 1 + GAP_ROWS_ABOVE_STACK) * LAYER_HEIGHT
  const minActiveY = ROWS_ABOVE_ACTIVE * LAYER_HEIGHT
  return Math.max(0, minActiveY - activeYUnscrolled)
}

export function stackLayerScreenY(layerIndex: number, layerCount: number): number {
  const scrollOffset = scrollOffsetForLayerCount(layerCount)
  return CANVAS_HEIGHT - (layerIndex + 1) * LAYER_HEIGHT + scrollOffset
}

export function activeLayerScreenY(layerCount: number): number {
  const scrollOffset = scrollOffsetForLayerCount(layerCount)
  return CANVAS_HEIGHT - (layerCount + 1 + GAP_ROWS_ABOVE_STACK) * LAYER_HEIGHT + scrollOffset
}
