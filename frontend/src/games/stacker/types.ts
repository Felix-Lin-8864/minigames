export type GameStatus = 'idle' | 'playing' | 'gameover'

export interface Layer {
  width: number
  xOffset: number
}

export interface StackerCoreState {
  layers: Layer[]
  currentWidth: number
  speedMultiplier: number
  score: number
  isGameOver: boolean
}

export interface TrimPiece {
  xOffset: number
  width: number
}

export interface LastDropResult {
  trimmedSide: 'left' | 'right' | null
  trimPiece: TrimPiece | null
  isPerfect: boolean
  pointsAwarded: number
}

export interface TrimAnimation {
  trimPiece: TrimPiece
  elapsedMs: number
}

export interface PerfectFlash {
  layerIndex: number
  elapsedMs: number
}

export interface StackerState extends StackerCoreState {
  status: GameStatus
  activeXOffset: number
  activeDirection: 1 | -1
  successfulLayers: number
  hasBouncedThisLayer: boolean
  lastDrop: LastDropResult | null
  trimAnimation: TrimAnimation | null
  perfectFlash: PerfectFlash | null
}

export type StackerAction =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'tick'; delta: number }
  | { type: 'drop' }

export interface StackerSnapshot {
  status: GameStatus
  layers: Layer[]
  currentWidth: number
  speedMultiplier: number
  score: number
  activeXOffset: number
  activeDirection: 1 | -1
  scrollOffset: number
  lastDrop: LastDropResult | null
  trimAnimation: TrimAnimation | null
  perfectFlash: PerfectFlash | null
}
