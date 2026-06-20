import {
  COLS,
  FROG_START_ROW,
  MAX_LOG_WIDTH,
  MAX_VEHICLE_WIDTH,
  MIN_LOG_WIDTH,
  MIN_VEHICLE_WIDTH,
  TOP_ROW,
  VIEWPORT_ROWS,
  difficultyForWorldRow,
  getWorldRowInfo,
  isLilypadWorldRow,
  isRoadWorldRow,
  isRiverWorldRow,
} from './constants'
import { createRng, randInt, randWeightedInt } from './rng'
import type { Car, Lilypad, Log } from './types'

const LOG_GAP_WEIGHTS = [
  { value: 1, weight: 1 },
  { value: 2, weight: 3 },
  { value: 3, weight: 3 },
  { value: 4, weight: 1 },
] as const

const VEHICLE_GAP_WEIGHTS = [
  { value: 1, weight: 1 },
  { value: 2, weight: 3 },
  { value: 3, weight: 1 },
] as const

function spawnMixedEntities<T extends { id: number; row: number; x: number; speed: number; width: number; direction: 1 | -1 }>(
  screenRow: number,
  entitySeed: number,
  startId: number,
  minWidth: number,
  maxWidth: number,
  baseSpeed: number,
  gapFor: (rng: () => number) => number,
  createEntity: (
    id: number,
    row: number,
    x: number,
    speed: number,
    width: number,
    direction: 1 | -1,
  ) => T,
): { entities: T[]; nextId: number } {
  const rng = createRng(entitySeed)
  const direction: 1 | -1 = rng() < 0.5 ? -1 : 1
  const speed = baseSpeed * (0.85 + rng() * 0.3)
  const entities: T[] = []
  let id = startId
  let x = rng() * 4

  while (x < COLS + maxWidth) {
    const width = randInt(rng, minWidth, maxWidth)
    const gap = gapFor(rng)

    entities.push(createEntity(id++, screenRow, x, speed, width, direction))
    x += width + gap
  }

  return { entities, nextId: id }
}

function vehicleGap(rng: () => number): number {
  return randWeightedInt(rng, VEHICLE_GAP_WEIGHTS)
}

function logGap(rng: () => number): number {
  return randWeightedInt(rng, LOG_GAP_WEIGHTS)
}

export function spawnCarsForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { cars: Car[]; nextId: number } {
  if (!isRoadWorldRow(worldRow)) return { cars: [], nextId: startId }

  const info = getWorldRowInfo(worldRow)
  const speed = (0.14 + info.segmentIndex * 0.012) * difficultyForWorldRow(worldRow)
  const spawned = spawnMixedEntities(
    screenRow,
    info.entitySeed,
    startId,
    MIN_VEHICLE_WIDTH,
    MAX_VEHICLE_WIDTH,
    speed,
    vehicleGap,
    (id, row, x, entitySpeed, width, direction) => ({
      id,
      row,
      x,
      speed: entitySpeed,
      width,
      direction,
      variant: width >= 3 ? ('truck' as const) : ('car' as const),
    }),
  )

  return { cars: spawned.entities, nextId: spawned.nextId }
}

export function spawnLogsForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { logs: Log[]; nextId: number } {
  if (!isRiverWorldRow(worldRow)) return { logs: [], nextId: startId }

  const info = getWorldRowInfo(worldRow)
  const speed = (0.18 + info.segmentIndex * 0.015) * difficultyForWorldRow(worldRow)
  const spawned = spawnMixedEntities(
    screenRow,
    info.entitySeed,
    startId,
    MIN_LOG_WIDTH,
    MAX_LOG_WIDTH,
    speed,
    logGap,
    (id, row, x, entitySpeed, width, direction) => ({
      id,
      row,
      x,
      speed: entitySpeed,
      width,
      direction,
    }),
  )

  return { logs: spawned.entities, nextId: spawned.nextId }
}

export function spawnLilypadsForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { lilypads: Lilypad[]; nextId: number } {
  if (!isLilypadWorldRow(worldRow)) return { lilypads: [], nextId: startId }

  const info = getWorldRowInfo(worldRow)
  const rng = createRng(info.entitySeed)
  const lilypads: Lilypad[] = []
  let id = startId
  let col = randInt(rng, 0, 2)

  while (col < COLS) {
    lilypads.push({ id: id++, row: screenRow, col })
    col += 1 + randInt(rng, 1, 2)
  }

  return { lilypads, nextId: id }
}

export function createInitialRowWorldRows(): number[] {
  const rows = new Array<number>(VIEWPORT_ROWS).fill(0)

  for (let row = 0; row <= FROG_START_ROW; row++) {
    rows[row] = 0
  }

  for (let row = FROG_START_ROW + 1; row < VIEWPORT_ROWS; row++) {
    rows[row] = row - FROG_START_ROW
  }

  return rows
}

export function spawnEntitiesForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { cars: Car[]; logs: Log[]; lilypads: Lilypad[]; nextId: number } {
  const carSpawn = spawnCarsForScreenRow(screenRow, worldRow, startId)
  const logSpawn = spawnLogsForScreenRow(screenRow, worldRow, carSpawn.nextId)
  const lilypadSpawn = spawnLilypadsForScreenRow(screenRow, worldRow, logSpawn.nextId)
  return {
    cars: carSpawn.cars,
    logs: logSpawn.logs,
    lilypads: lilypadSpawn.lilypads,
    nextId: lilypadSpawn.nextId,
  }
}

export function buildInitialEntities(
  rowWorldRows: number[],
  startId: number,
): { cars: Car[]; logs: Log[]; lilypads: Lilypad[]; nextId: number } {
  let nextId = startId
  const cars: Car[] = []
  const logs: Log[] = []
  const lilypads: Lilypad[] = []

  for (let row = 0; row < rowWorldRows.length; row++) {
    const spawned = spawnEntitiesForScreenRow(row, rowWorldRows[row], nextId)
    nextId = spawned.nextId
    cars.push(...spawned.cars)
    logs.push(...spawned.logs)
    lilypads.push(...spawned.lilypads)
  }

  return { cars, logs, lilypads, nextId }
}

export function spawnTopRowEntities(
  worldRow: number,
  startId: number,
): { cars: Car[]; logs: Log[]; lilypads: Lilypad[]; nextId: number } {
  return spawnEntitiesForScreenRow(TOP_ROW, worldRow, startId)
}
