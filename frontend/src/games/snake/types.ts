export type GameStatus = 'idle' | 'playing' | 'gameover'

export type Direction = 'up' | 'down' | 'left' | 'right'

export type PelletType = 'normal' | 'golden' | 'shrink' | 'red'

export interface Point {
  col: number
  row: number
}

export interface Pellet extends Point {
  type: PelletType
}

export interface SnakeState {
  status: GameStatus
  snake: Point[]
  direction: Direction
  pendingDirection: Direction | null
  pellets: Pellet[]
  walls: Point[]
  score: number
  snakeIsRed: boolean
  wallBreaksRemaining: number
}

export type SnakeAction =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'tick' }
  | { type: 'setDirection'; direction: Direction }

export interface SnakeSnapshot {
  status: GameStatus
  snake: Point[]
  direction: Direction
  pellets: Pellet[]
  walls: Point[]
  score: number
  tickMs: number
  snakeIsRed: boolean
  wallBreaksRemaining: number
}
