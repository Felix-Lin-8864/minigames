import {
  BOTTOM_ROW,
  COLS,
  FROG_START_ROW,
  HIDDEN_COLS,
  MOVEMENT_SCALE,
  TOP_ROW,
  VIEWPORT_ROWS,
  VISIBLE_COL_MAX,
  VISIBLE_COL_MIN,
  VISIBLE_COLS,
  isRiverWorldRow,
  isLilypadWorldRow,
} from './constants'
import {
  buildInitialEntities,
  createInitialRowWorldRows,
  spawnTopRowEntities,
} from './worldGen'
import type { Car, Frog, FroggerAction, FroggerSnapshot, FroggerState, Lilypad, Log } from './types'

function createFrog(row = FROG_START_ROW): Frog {
  const startCol = HIDDEN_COLS + Math.floor(VISIBLE_COLS / 2)
  return {
    col: startCol,
    row,
    x: startCol,
    onLogId: null,
    logOffset: 0,
  }
}

export function createInitialState(): FroggerState {
  const rowWorldRows = createInitialRowWorldRows()
  const entities = buildInitialEntities(rowWorldRows, 1)

  return {
    status: 'idle',
    frog: createFrog(),
    cars: entities.cars,
    logs: entities.logs,
    lilypads: entities.lilypads,
    rowWorldRows,
    score: 0,
    nextWorldRow: VIEWPORT_ROWS - FROG_START_ROW,
    nextEntityId: entities.nextId,
  }
}

function wrapCol(col: number): number {
  return ((col % COLS) + COLS) % COLS
}

function wrapX(x: number): number {
  const wrapped = x % COLS
  return wrapped < 0 ? wrapped + COLS : wrapped
}

function worldRowAt(state: FroggerState, screenRow: number): number {
  return state.rowWorldRows[screenRow] ?? 0
}

function isRiverScreenRow(state: FroggerState, screenRow: number): boolean {
  return isRiverWorldRow(worldRowAt(state, screenRow))
}

function isLilypadScreenRow(state: FroggerState, screenRow: number): boolean {
  return isLilypadWorldRow(worldRowAt(state, screenRow))
}

function moveEntities<T extends Car | Log>(entities: T[], delta: number): T[] {
  return entities.map((entity) => ({
    ...entity,
    x: wrapX(entity.x + entity.speed * entity.direction * delta * MOVEMENT_SCALE),
  }))
}

function frogCenterX(frog: Frog): number {
  return frog.x + 0.5
}

function isFrogOffScreen(center: number): boolean {
  return center < VISIBLE_COL_MIN || center >= VISIBLE_COL_MIN + VISIBLE_COLS
}

function isPointOnSegment(point: number, start: number, width: number): boolean {
  if (point >= start && point < start + width) return true
  const end = start + width
  if (end > COLS && point < end - COLS) return true
  return false
}

function isFrogOnLog(frog: Frog, log: Log): boolean {
  if (frog.row !== log.row) return false
  return isPointOnSegment(frogCenterX(frog), log.x, log.width)
}

function rideFrogOnLog(frog: Frog, log: Log, logOffset?: number): Frog {
  const offset =
    logOffset ??
    (frog.onLogId === log.id ? frog.logOffset : frog.x - log.x)
  const x = log.x + offset
  const col = wrapCol(Math.round(x))
  return { ...frog, onLogId: log.id, logOffset: offset, x, col }
}

function driftFrogOnLog(frog: Frog, log: Log): Frog {
  const x = log.x + frog.logOffset
  const col = wrapCol(Math.round(x))
  return { ...frog, onLogId: log.id, x, col }
}

function clearLogRide(frog: Frog): Frog {
  return { ...frog, onLogId: null, logOffset: 0, x: frog.col }
}

function isFrogOnLilypad(frog: Frog, lilypads: Lilypad[]): boolean {
  const center = frogCenterX(frog)
  return lilypads.some(
    (pad) => pad.row === frog.row && isPointOnSegment(center, pad.col, 1),
  )
}

function isOnLog(frog: Frog, logs: Log[]): Log | null {
  if (frog.onLogId != null) {
    const riding = logs.find((log) => log.id === frog.onLogId)
    if (riding && isFrogOnLog(frog, riding)) return riding
  }

  return logs.find((log) => isFrogOnLog(frog, log)) ?? null
}

function hitsCar(frog: Frog, cars: Car[]): boolean {
  const center = frogCenterX(frog)
  return cars.some(
    (car) =>
      car.row === frog.row &&
      isPointOnSegment(center, car.x + 0.15, car.width - 0.3),
  )
}

function withBestScore(state: FroggerState): FroggerState {
  const forward = tilesForward(state)
  if (forward <= state.score) return state
  return { ...state, score: forward }
}

export function tilesForward(snapshot: Pick<FroggerSnapshot, 'frog' | 'rowWorldRows'>): number {
  return Math.max(0, snapshot.rowWorldRows[snapshot.frog.row] ?? 0)
}

/** Shift all rows toward the bottom; spawn a new row at the top (row 12). */
function scrollRowsDown(state: FroggerState): FroggerState {
  const rowWorldRows = [...state.rowWorldRows]
  for (let row = BOTTOM_ROW; row < TOP_ROW; row++) {
    rowWorldRows[row] = rowWorldRows[row + 1]
  }
  rowWorldRows[TOP_ROW] = state.nextWorldRow

  let cars = state.cars
    .map((car) => ({ ...car, row: car.row - 1 }))
    .filter((car) => car.row >= BOTTOM_ROW)

  let logs = state.logs
    .map((log) => ({ ...log, row: log.row - 1 }))
    .filter((log) => log.row >= BOTTOM_ROW)

  let lilypads = state.lilypads
    .map((pad) => ({ ...pad, row: pad.row - 1 }))
    .filter((pad) => pad.row >= BOTTOM_ROW)

  const spawned = spawnTopRowEntities(rowWorldRows[TOP_ROW], state.nextEntityId)
  cars = [...cars, ...spawned.cars]
  logs = [...logs, ...spawned.logs]
  lilypads = [...lilypads, ...spawned.lilypads]

  return {
    ...state,
    rowWorldRows,
    cars,
    logs,
    lilypads,
    nextWorldRow: state.nextWorldRow + 1,
    nextEntityId: spawned.nextId,
  }
}

function gameOver(state: FroggerState): FroggerState {
  return { ...state, status: 'gameover' }
}

function validateFrogPlacement(state: FroggerState, frog: Frog): FroggerState | 'dead' {
  if (hitsCar(frog, state.cars)) return 'dead'

  if (isRiverScreenRow(state, frog.row)) {
    const log = isOnLog(frog, state.logs)
    if (!log) return 'dead'
    return { ...state, frog: rideFrogOnLog(frog, log) }
  }

  if (isLilypadScreenRow(state, frog.row)) {
    if (!isFrogOnLilypad(frog, state.lilypads)) return 'dead'
    return { ...state, frog: clearLogRide(frog) }
  }

  return { ...state, frog: clearLogRide(frog) }
}

function applyMove(state: FroggerState, dCol: number, screenDr: number): FroggerState {
  if (state.status !== 'playing') return state
  if (screenDr === 0 && dCol === 0) return state

  let next = state
  let frog = { ...state.frog }

  if (screenDr < 0) {
    // Up: scroll the map down (toward bottom index) and spawn row 12
    next = scrollRowsDown(next)
    frog = { ...frog, onLogId: null, logOffset: 0 }
  } else if (screenDr > 0) {
    // Down: move frog one row toward the bottom
    if (frog.row <= BOTTOM_ROW) return state
    frog = clearLogRide({ ...frog, row: frog.row - 1, x: frog.col })
  }

  if (dCol !== 0) {
    if (
      isRiverScreenRow(next, frog.row) &&
      frog.onLogId != null &&
      screenDr === 0
    ) {
      const log = next.logs.find((entry) => entry.id === frog.onLogId)
      if (!log) return gameOver(state)

      const logOffset = Math.max(0, Math.min(log.width - 1, frog.logOffset + dCol))
      frog = rideFrogOnLog(frog, log, logOffset)
    } else {
      const col = Math.max(VISIBLE_COL_MIN, Math.min(VISIBLE_COL_MAX, frog.col + dCol))
      frog = clearLogRide({ ...frog, col, x: col })
    }
  }

  next = { ...next, frog }
  const validated = validateFrogPlacement(next, frog)
  if (validated === 'dead') return gameOver(state)

  next = withBestScore(validated)
  return next
}

export function froggerReducer(
  state: FroggerState,
  action: FroggerAction,
): FroggerState {
  switch (action.type) {
    case 'start':
      return { ...createInitialState(), status: 'playing' }

    case 'restart':
      return { ...createInitialState(), status: 'playing' }

    case 'move':
      return applyMove(state, action.dCol, action.dRow)

    case 'tick': {
      if (state.status !== 'playing') return state

      const cars = moveEntities(state.cars, action.delta)
      const logs = moveEntities(state.logs, action.delta)

      let frog = { ...state.frog }
      const next: FroggerState = { ...state, cars, logs }

      if (isRiverScreenRow(next, frog.row)) {
        const log =
          (frog.onLogId != null ? logs.find((entry) => entry.id === frog.onLogId) : null) ??
          isOnLog(frog, logs)

        if (!log) return gameOver(state)

        frog = driftFrogOnLog(frog, log)

        const center = frogCenterX(frog)
        if (isFrogOffScreen(center)) return gameOver(state)
        if (!isFrogOnLog(frog, log)) return gameOver(state)
      } else if (isLilypadScreenRow(next, frog.row)) {
        if (!isFrogOnLilypad(frog, next.lilypads)) return gameOver(state)
        frog = clearLogRide(frog)
      } else if (frog.onLogId != null) {
        frog = clearLogRide(frog)
      }

      if (hitsCar(frog, cars)) return gameOver(state)

      return { ...next, frog }
    }

    default:
      return state
  }
}

export function toSnapshot(state: FroggerState) {
  return {
    status: state.status,
    frog: state.frog,
    cars: state.cars,
    logs: state.logs,
    lilypads: state.lilypads,
    rowWorldRows: state.rowWorldRows,
    score: state.score,
  }
}
