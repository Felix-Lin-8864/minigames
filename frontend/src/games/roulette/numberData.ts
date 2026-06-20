export type PocketColor = 'red' | 'black' | 'green'
export type Parity = 'odd' | 'even' | 'none'
export type HighLow = 'low' | 'high' | 'none'
export type Dozen = 'first' | 'second' | 'third' | 'none'
export type Column = 1 | 2 | 3 | 'none'

export interface PocketData {
  number: number
  color: PocketColor
  parity: Parity
  highLow: HighLow
  dozen: Dozen
  column: Column
}

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
])

function dozenFor(n: number): Dozen {
  if (n >= 1 && n <= 12) return 'first'
  if (n >= 13 && n <= 24) return 'second'
  if (n >= 25 && n <= 36) return 'third'
  return 'none'
}

function columnFor(n: number): Column {
  if (n === 0) return 'none'
  const mod = n % 3
  if (mod === 1) return 1
  if (mod === 2) return 2
  return 3
}

function buildPocketData(n: number): PocketData {
  if (n === 0) {
    return {
      number: 0,
      color: 'green',
      parity: 'none',
      highLow: 'none',
      dozen: 'none',
      column: 'none',
    }
  }

  return {
    number: n,
    color: RED_NUMBERS.has(n) ? 'red' : 'black',
    parity: n % 2 === 0 ? 'even' : 'odd',
    highLow: n <= 18 ? 'low' : 'high',
    dozen: dozenFor(n),
    column: columnFor(n),
  }
}

export const NUMBER_DATA: Record<number, PocketData> = Object.fromEntries(
  Array.from({ length: 37 }, (_, i) => [i, buildPocketData(i)]),
)

export function pocketsMatching(
  predicate: (data: PocketData) => boolean,
): number[] {
  return Array.from({ length: 37 }, (_, i) => i).filter((n) =>
    predicate(NUMBER_DATA[n]!),
  )
}

export const RED_POCKETS = pocketsMatching((d) => d.color === 'red')
export const BLACK_POCKETS = pocketsMatching((d) => d.color === 'black')
export const ODD_POCKETS = pocketsMatching((d) => d.parity === 'odd')
export const EVEN_POCKETS = pocketsMatching((d) => d.parity === 'even')
export const LOW_POCKETS = pocketsMatching((d) => d.highLow === 'low')
export const HIGH_POCKETS = pocketsMatching((d) => d.highLow === 'high')
export const DOZEN1_POCKETS = pocketsMatching((d) => d.dozen === 'first')
export const DOZEN2_POCKETS = pocketsMatching((d) => d.dozen === 'second')
export const DOZEN3_POCKETS = pocketsMatching((d) => d.dozen === 'third')
export const COLUMN1_POCKETS = pocketsMatching((d) => d.column === 1)
export const COLUMN2_POCKETS = pocketsMatching((d) => d.column === 2)
export const COLUMN3_POCKETS = pocketsMatching((d) => d.column === 3)
