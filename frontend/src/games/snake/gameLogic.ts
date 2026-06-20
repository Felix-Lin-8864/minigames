import {
  GOLDEN_FOOD_POINTS,
  GRID_COLS,
  GRID_ROWS,
  INITIAL_TICK_MS,
  MAX_MAP_WALLS,
  MAX_PELLETS,
  MIN_MAP_WALLS,
  MIN_SNAKE_LENGTH,
  MIN_TICK_MS,
  NORMAL_FOOD_POINTS,
  RED_PELLET_MIN_SCORE,
  RED_WALL_BREAKS,
  SHRINK_SEGMENTS,
  TICK_SPEEDUP_MS,
  WALL_SCORE_INTERVAL,
} from './constants'
import type {
  Direction,
  Pellet,
  PelletType,
  Point,
  SnakeAction,
  SnakeSnapshot,
  SnakeState,
} from './types'

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const DELTA: Record<Direction, Point> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
}

function pointKey(point: Point): string {
  return `${point.col},${point.row}`
}

function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j]!, items[i]!]
  }
}

function pickPelletType(score: number): PelletType {
  const roll = Math.random()

  if (score >= RED_PELLET_MIN_SCORE) {
    if (roll < 0.42) return 'normal'
    if (roll < 0.62) return 'golden'
    if (roll < 0.8) return 'shrink'
    return 'red'
  }

  if (roll < 0.55) return 'normal'
  if (roll < 0.8) return 'golden'
  return 'shrink'
}

function randomWallCount(): number {
  return MIN_MAP_WALLS + Math.floor(Math.random() * (MAX_MAP_WALLS - MIN_MAP_WALLS + 1))
}

function occupiedCells(
  snake: Point[],
  walls: Point[],
  pellets: Pellet[],
): Set<string> {
  const occupied = new Set<string>()
  for (const segment of snake) occupied.add(pointKey(segment))
  for (const wall of walls) occupied.add(pointKey(wall))
  for (const pellet of pellets) occupied.add(pointKey(pellet))
  return occupied
}

function emptyCells(blocked: Set<string>): Point[] {
  const empty: Point[] = []

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const cell = { col, row }
      if (!blocked.has(pointKey(cell))) {
        empty.push(cell)
      }
    }
  }

  return empty
}

export function generateWalls(snake: Point[], count: number): Point[] {
  const blocked = new Set(snake.map(pointKey))
  const candidates = emptyCells(blocked)
  shuffleInPlace(candidates)

  return candidates.slice(0, Math.min(count, candidates.length))
}

function removePelletsUnderWalls(pellets: Pellet[], walls: Point[]): Pellet[] {
  const wallKeys = new Set(walls.map(pointKey))
  return pellets.filter((pellet) => !wallKeys.has(pointKey(pellet)))
}

function spawnPellet(
  snake: Point[],
  walls: Point[],
  pellets: Pellet[],
  score: number,
): Pellet | null {
  const blocked = occupiedCells(snake, walls, pellets)
  const candidates = emptyCells(blocked)

  if (candidates.length === 0) return null

  const position = candidates[Math.floor(Math.random() * candidates.length)]!
  return { ...position, type: pickPelletType(score) }
}

function fillPellets(
  snake: Point[],
  walls: Point[],
  pellets: Pellet[],
  score: number,
): Pellet[] {
  const nextPellets = [...pellets]

  while (nextPellets.length < MAX_PELLETS) {
    const pellet = spawnPellet(snake, walls, nextPellets, score)
    if (!pellet) break
    nextPellets.push(pellet)
  }

  return nextPellets
}

function createInitialSnake(): Point[] {
  const centerCol = Math.floor(GRID_COLS / 2)
  const centerRow = Math.floor(GRID_ROWS / 2)

  return [
    { col: centerCol, row: centerRow },
    { col: centerCol - 1, row: centerRow },
    { col: centerCol - 2, row: centerRow },
  ]
}

export function createInitialState(): SnakeState {
  const snake = createInitialSnake()
  const walls: Point[] = []

  return {
    status: 'idle',
    snake,
    direction: 'right',
    pendingDirection: null,
    pellets: fillPellets(snake, walls, [], 0),
    walls,
    score: 0,
    snakeIsRed: false,
    wallBreaksRemaining: 0,
  }
}

export function tickMsForScore(score: number): number {
  return Math.max(MIN_TICK_MS, INITIAL_TICK_MS - score * TICK_SPEEDUP_MS)
}

function wallTierForScore(score: number): number {
  return Math.floor(score / WALL_SCORE_INTERVAL)
}

function applyDirection(
  current: Direction,
  pending: Direction | null,
): Direction {
  if (!pending || pending === OPPOSITE[current]) {
    return current
  }

  return pending
}

function isBoundaryCollision(head: Point): boolean {
  return head.col < 0 || head.col >= GRID_COLS || head.row < 0 || head.row >= GRID_ROWS
}

function isSelfCollision(head: Point, snake: Point[], willGrow: boolean): boolean {
  const body = willGrow ? snake : snake.slice(0, -1)
  return body.some((segment) => segment.col === head.col && segment.row === head.row)
}

function pelletAt(head: Point, pellets: Pellet[]): Pellet | null {
  return pellets.find((pellet) => pellet.col === head.col && pellet.row === head.row) ?? null
}

function pointsForPellet(type: PelletType): number {
  switch (type) {
    case 'normal':
      return NORMAL_FOOD_POINTS
    case 'golden':
      return GOLDEN_FOOD_POINTS
    case 'shrink':
    case 'red':
      return 0
  }
}

function pelletMakesSnakeGrow(type: PelletType): boolean {
  return type === 'normal' || type === 'golden'
}

function applyPelletToSnake(snake: Point[], head: Point, pellet: Pellet): Point[] {
  if (pelletMakesSnakeGrow(pellet.type)) {
    return [head, ...snake]
  }

  if (pellet.type === 'red') {
    return [head, ...snake.slice(0, -1)]
  }

  const moved = [head, ...snake.slice(0, -1)]
  const targetLength = Math.max(MIN_SNAKE_LENGTH, moved.length - SHRINK_SEGMENTS)
  return moved.slice(0, targetLength)
}

function resolveMapWallCollision(
  head: Point,
  walls: Point[],
  wallBreaksRemaining: number,
): { walls: Point[]; wallBreaksRemaining: number; blocked: boolean } {
  const wallIndex = walls.findIndex(
    (wall) => wall.col === head.col && wall.row === head.row,
  )

  if (wallIndex === -1) {
    return { walls, wallBreaksRemaining, blocked: false }
  }

  if (wallBreaksRemaining > 0) {
    const nextWalls = walls.filter((_, index) => index !== wallIndex)
    const nextBreaks = wallBreaksRemaining - 1

    return {
      walls: nextWalls,
      wallBreaksRemaining: nextBreaks,
      blocked: false,
    }
  }

  return { walls, wallBreaksRemaining, blocked: true }
}

function moveSnake(state: SnakeState): SnakeState {
  const direction = applyDirection(state.direction, state.pendingDirection)
  const delta = DELTA[direction]
  const head = state.snake[0]!
  const newHead = { col: head.col + delta.col, row: head.row + delta.row }
  const eatenPellet = pelletAt(newHead, state.pellets)
  const willGrow = eatenPellet ? pelletMakesSnakeGrow(eatenPellet.type) : false

  const wallResolution = resolveMapWallCollision(
    newHead,
    state.walls,
    state.wallBreaksRemaining,
  )

  if (
    isBoundaryCollision(newHead) ||
    wallResolution.blocked ||
    isSelfCollision(newHead, state.snake, willGrow)
  ) {
    return {
      ...state,
      direction,
      pendingDirection: null,
      status: 'gameover',
    }
  }

  const nextSnake = eatenPellet
    ? applyPelletToSnake(state.snake, newHead, eatenPellet)
    : [newHead, ...state.snake.slice(0, -1)]

  const nextScore = eatenPellet
    ? state.score + pointsForPellet(eatenPellet.type)
    : state.score

  const mapReshuffled =
    wallTierForScore(nextScore) > wallTierForScore(state.score)

  const walls = mapReshuffled
    ? generateWalls(nextSnake, randomWallCount())
    : wallResolution.walls

  let wallBreaksRemaining = wallResolution.wallBreaksRemaining
  let snakeIsRed: boolean

  if (eatenPellet?.type === 'red') {
    snakeIsRed = true
    wallBreaksRemaining = RED_WALL_BREAKS
  } else {
    snakeIsRed = wallBreaksRemaining > 0
  }

  const pelletsAfterEat = eatenPellet
    ? state.pellets.filter(
        (pellet) => pellet.col !== eatenPellet.col || pellet.row !== eatenPellet.row,
      )
    : state.pellets

  const pelletsAfterWallCull = mapReshuffled
    ? removePelletsUnderWalls(pelletsAfterEat, walls)
    : pelletsAfterEat

  const nextPellets = fillPellets(nextSnake, walls, pelletsAfterWallCull, nextScore)

  if (
    eatenPellet &&
    nextPellets.length === pelletsAfterWallCull.length &&
    nextSnake.length >= GRID_COLS * GRID_ROWS - walls.length
  ) {
    return {
      ...state,
      snake: nextSnake,
      direction,
      pendingDirection: null,
      walls,
      pellets: pelletsAfterWallCull,
      score: nextScore,
      snakeIsRed,
      wallBreaksRemaining,
      status: 'gameover',
    }
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: null,
    walls,
    pellets: nextPellets,
    score: nextScore,
    snakeIsRed,
    wallBreaksRemaining,
  }
}

export function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  switch (action.type) {
    case 'start':
      return { ...createInitialState(), status: 'playing' }
    case 'restart':
      return { ...createInitialState(), status: 'playing' }
    case 'tick':
      if (state.status !== 'playing') return state
      return moveSnake(state)
    case 'setDirection': {
      if (state.status !== 'playing') return state
      if (action.direction === OPPOSITE[state.direction]) return state
      return { ...state, pendingDirection: action.direction }
    }
  }
}

export function toSnapshot(state: SnakeState): SnakeSnapshot {
  return {
    status: state.status,
    snake: state.snake,
    direction: state.direction,
    pellets: state.pellets,
    walls: state.walls,
    score: state.score,
    tickMs: tickMsForScore(state.score),
    snakeIsRed: state.snakeIsRed,
    wallBreaksRemaining: state.wallBreaksRemaining,
  }
}
