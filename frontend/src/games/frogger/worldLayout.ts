import { createRng, hashSeed, randBool, randInt } from './rng'

export type LaneType = 'start' | 'road' | 'median' | 'river' | 'lilypad' | 'safe'

const SEGMENT_ROAD = 1
const SEGMENT_MEDIAN = 2
const SEGMENT_RIVER = 3
const SEGMENT_RIVER2 = 4
const SEGMENT_SAFE = 5
const SEGMENT_LILYPAD = 6

export const MIN_SECTION_HEIGHT = 1
export const MAX_SECTION_HEIGHT = 8

export interface WorldRowInfo {
  laneType: LaneType
  segmentIndex: number
  segmentHeight: number
  entitySeed: number
}

const rowInfoCache = new Map<number, WorldRowInfo>()

function makeInfo(
  laneType: LaneType,
  segmentIndex: number,
  segmentHeight: number,
  entitySeed: number,
): WorldRowInfo {
  return { laneType, segmentIndex, segmentHeight, entitySeed }
}

function cacheAndReturn(worldRow: number, info: WorldRowInfo): WorldRowInfo {
  rowInfoCache.set(worldRow, info)
  return info
}

/** Procedural layout: road and river blocks (1–8 rows), lilypads between back-to-back rivers. */
function resolveWorldRow(worldRow: number): WorldRowInfo {
  if (worldRow <= 0) {
    return makeInfo('start', 0, 1, hashSeed(0))
  }

  let cursor = 1
  let cycle = 0

  while (cursor <= worldRow) {
    const cycleSeed = hashSeed(cycle)
    const roadHeight = randInt(createRng(cycleSeed), MIN_SECTION_HEIGHT, MAX_SECTION_HEIGHT)

    if (worldRow < cursor + roadHeight) {
      return makeInfo(
        'road',
        worldRow - cursor,
        roadHeight,
        hashSeed(cycle, SEGMENT_ROAD, worldRow - cursor),
      )
    }
    cursor += roadHeight

    if (worldRow < cursor + 1) {
      return makeInfo('median', 0, 1, hashSeed(cycle, SEGMENT_MEDIAN))
    }
    cursor += 1

    const riverHeight = randInt(createRng(cycleSeed ^ 0x9e3779b9), MIN_SECTION_HEIGHT, MAX_SECTION_HEIGHT)

    if (worldRow < cursor + riverHeight) {
      return makeInfo(
        'river',
        worldRow - cursor,
        riverHeight,
        hashSeed(cycle, SEGMENT_RIVER, worldRow - cursor),
      )
    }
    cursor += riverHeight

    const rng = createRng(cycleSeed ^ 0x85ebca6b)
    if (randBool(rng, 0.35)) {
      const separator: LaneType = randBool(rng) ? 'lilypad' : 'median'
      if (worldRow < cursor + 1) {
        return makeInfo(separator, 0, 1, hashSeed(cycle, separator === 'lilypad' ? SEGMENT_LILYPAD : SEGMENT_MEDIAN))
      }
      cursor += 1

      const river2Height = randInt(rng, MIN_SECTION_HEIGHT, MAX_SECTION_HEIGHT)
      if (worldRow < cursor + river2Height) {
        return makeInfo(
          'river',
          worldRow - cursor,
          river2Height,
          hashSeed(cycle, SEGMENT_RIVER2, worldRow - cursor),
        )
      }
      cursor += river2Height
    }

    if (worldRow < cursor + 1) {
      return makeInfo('safe', 0, 1, hashSeed(cycle, SEGMENT_SAFE))
    }
    cursor += 1

    cycle += 1
  }

  return makeInfo('safe', 0, 1, hashSeed(cycle))
}

export function getWorldRowInfo(worldRow: number): WorldRowInfo {
  const cached = rowInfoCache.get(worldRow)
  if (cached) return cached
  return cacheAndReturn(worldRow, resolveWorldRow(worldRow))
}

export function laneTypeForWorldRow(worldRow: number): LaneType {
  return getWorldRowInfo(worldRow).laneType
}

export function isRoadWorldRow(worldRow: number): boolean {
  return laneTypeForWorldRow(worldRow) === 'road'
}

export function isRiverWorldRow(worldRow: number): boolean {
  return laneTypeForWorldRow(worldRow) === 'river'
}

export function isLilypadWorldRow(worldRow: number): boolean {
  return laneTypeForWorldRow(worldRow) === 'lilypad'
}

export function difficultyForWorldRow(worldRow: number): number {
  return 1 + Math.floor(Math.max(0, worldRow) / 18) * 0.08
}
