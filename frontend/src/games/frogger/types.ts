export type GameStatus = 'idle' | 'playing' | 'gameover'

export interface Frog {
  col: number
  row: number
  x: number
  onLogId: number | null
  /** Horizontal offset from the riding log's x while drifting. */
  logOffset: number
}

export interface Car {
  id: number
  row: number
  x: number
  speed: number
  width: number
  direction: 1 | -1
  variant: 'car' | 'truck'
}

export interface Log {
  id: number
  row: number
  x: number
  speed: number
  width: number
  direction: 1 | -1
}

export interface FroggerState {
  status: GameStatus
  frog: Frog
  cars: Car[]
  logs: Log[]
  /** World row index for each screen row (bottom-indexed). */
  rowWorldRows: number[]
  score: number
  nextWorldRow: number
  nextEntityId: number
}

export type FroggerAction =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'tick'; delta: number }
  | { type: 'move'; dCol: number; dRow: number }

export interface FroggerSnapshot {
  status: GameStatus
  frog: Frog
  cars: Car[]
  logs: Log[]
  rowWorldRows: number[]
  score: number
}
