import {
  COLS,
  FROG_START_ROW,
  ROAD_LANE_CONFIG,
  RIVER_LANE_CONFIG,
  TOP_ROW,
  VIEWPORT_ROWS,
  difficultyForWorldRow,
  isRoadWorldRow,
  isRiverWorldRow,
  roadLaneIndex,
  riverLaneIndex,
} from './constants'
import type { Car, Log } from './types'

export function spawnCarsForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { cars: Car[]; nextId: number } {
  if (!isRoadWorldRow(worldRow)) return { cars: [], nextId: startId }

  const laneIndex = roadLaneIndex(worldRow)
  const config = ROAD_LANE_CONFIG[laneIndex]
  const speed = config.speed * difficultyForWorldRow(worldRow)
  const spacing = COLS / config.count
  const cars: Car[] = []
  let id = startId

  for (let i = 0; i < config.count; i++) {
    cars.push({
      id: id++,
      row: screenRow,
      x: i * spacing + (config.direction === 1 ? 0 : spacing / 2),
      speed,
      width: config.width,
      direction: config.direction,
      variant: config.width >= 3 ? 'truck' : 'car',
    })
  }

  return { cars, nextId: id }
}

export function spawnLogsForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { logs: Log[]; nextId: number } {
  if (!isRiverWorldRow(worldRow)) return { logs: [], nextId: startId }

  const laneIndex = riverLaneIndex(worldRow)
  const config = RIVER_LANE_CONFIG[laneIndex]
  const speed = config.speed * difficultyForWorldRow(worldRow)
  const spacing = COLS / config.count
  const logs: Log[] = []
  let id = startId

  for (let i = 0; i < config.count; i++) {
    logs.push({
      id: id++,
      row: screenRow,
      x: i * spacing + (config.direction === 1 ? 0 : spacing / 2),
      speed,
      width: config.width,
      direction: config.direction,
    })
  }

  return { logs, nextId: id }
}

export function createInitialRowWorldRows(): number[] {
  const rows = new Array<number>(VIEWPORT_ROWS).fill(0)

  // Spawn zone through frog start row: grassland (world row 0).
  for (let row = 0; row <= FROG_START_ROW; row++) {
    rows[row] = 0
  }

  // Lanes ahead of the frog begin the endless cycle.
  for (let row = FROG_START_ROW + 1; row < VIEWPORT_ROWS; row++) {
    rows[row] = row - FROG_START_ROW
  }

  return rows
}

export function spawnEntitiesForScreenRow(
  screenRow: number,
  worldRow: number,
  startId: number,
): { cars: Car[]; logs: Log[]; nextId: number } {
  const carSpawn = spawnCarsForScreenRow(screenRow, worldRow, startId)
  const logSpawn = spawnLogsForScreenRow(screenRow, worldRow, carSpawn.nextId)
  return {
    cars: carSpawn.cars,
    logs: logSpawn.logs,
    nextId: logSpawn.nextId,
  }
}

export function buildInitialEntities(
  rowWorldRows: number[],
  startId: number,
): { cars: Car[]; logs: Log[]; nextId: number } {
  let nextId = startId
  const cars: Car[] = []
  const logs: Log[] = []

  for (let row = 0; row < rowWorldRows.length; row++) {
    const spawned = spawnEntitiesForScreenRow(row, rowWorldRows[row], nextId)
    nextId = spawned.nextId
    cars.push(...spawned.cars)
    logs.push(...spawned.logs)
  }

  return { cars, logs, nextId }
}

export function spawnTopRowEntities(
  worldRow: number,
  startId: number,
): { cars: Car[]; logs: Log[]; nextId: number } {
  return spawnEntitiesForScreenRow(TOP_ROW, worldRow, startId)
}
