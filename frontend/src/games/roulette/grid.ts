/**
 * Standard European roulette number block.
 * Row 1 (bottom): 1, 2, 3 — row 12 (top): 34, 35, 36.
 * Columns are column-major: col 1 = 1,4,7,..., col 2 = 2,5,8,..., col 3 = 3,6,9,...
 */
export const GRID_ROWS = 12
export const GRID_COLS = 3

/** grid[row][col] where row 1 is bottom, row 12 is top. */
export const GRID: number[][] = Array.from({ length: GRID_ROWS }, (_, rowIdx) => {
  const row = rowIdx + 1
  return [3 * row - 2, 3 * row - 1, 3 * row]
})

const positionByNumber = new Map<number, { row: number; col: number }>()
for (let row = 1; row <= GRID_ROWS; row += 1) {
  for (let col = 0; col < GRID_COLS; col += 1) {
    positionByNumber.set(GRID[row - 1]![col]!, { row, col })
  }
}

function sortedKey(numbers: number[]): string {
  return [...numbers].sort((a, b) => a - b).join('-')
}

function buildSet(sizes: number[], generator: () => number[][]): Set<string> {
  const set = new Set<string>()
  for (const nums of generator()) {
    if (nums.length === sizes[0] || sizes.includes(nums.length)) {
      set.add(sortedKey(nums))
    }
  }
  return set
}

function allStreets(): number[][] {
  const streets: number[][] = []
  for (let row = 1; row <= GRID_ROWS; row += 1) {
    streets.push(GRID[row - 1]!)
  }
  return streets
}

function allSplits(): number[][] {
  const splits: number[][] = []

  // 0 splits with bottom row
  splits.push([0, 1], [0, 2], [0, 3])

  for (let row = 1; row <= GRID_ROWS; row += 1) {
    const [a, b, c] = GRID[row - 1]!
    splits.push([a, b], [b, c])
    if (row < GRID_ROWS) {
      const [d, e, f] = GRID[row]!
      splits.push([a, d], [b, e], [c, f])
    }
  }

  return splits
}

function allCorners(): number[][] {
  const corners: number[][] = []
  for (let row = 1; row < GRID_ROWS; row += 1) {
    const [a, b, c] = GRID[row - 1]!
    const [d, e, f] = GRID[row]!
    corners.push([a, b, d, e], [b, c, e, f])
  }
  return corners
}

function allSixLines(): number[][] {
  const sixLines: number[][] = []
  for (let row = 1; row < GRID_ROWS; row += 1) {
    sixLines.push([...GRID[row - 1]!, ...GRID[row]!])
  }
  return sixLines
}

export const VALID_STREETS = buildSet([3], allStreets)
export const VALID_SPLITS = buildSet([2], allSplits)
export const VALID_CORNERS = buildSet([4], allCorners)
export const VALID_SIX_LINES = buildSet([6], allSixLines)

export function isAdjacentPair(a: number, b: number): boolean {
  return VALID_SPLITS.has(sortedKey([a, b]))
}

export function getStreetForRow(row: number): number[] {
  return GRID[row - 1]!
}

export function getPosition(number: number): { row: number; col: number } | null {
  return positionByNumber.get(number) ?? null
}

export function zoneKey(type: string, numbers: number[]): string {
  return `${type}:${sortedKey(numbers)}`
}
