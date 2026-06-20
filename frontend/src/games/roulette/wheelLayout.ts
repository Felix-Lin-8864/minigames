import { WHEEL_POCKETS } from './constants'
import { NUMBER_DATA } from './numberData'

/** European single-zero wheel order (clockwise). */
export const WHEEL_ORDER: readonly number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16,
  33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

const POCKET_ANGLE = 360 / WHEEL_POCKETS

const POCKET_COLORS = {
  red: '#b91c1c',
  black: '#1a1a1a',
  green: '#15803d',
} as const

export function pocketFill(number: number): string {
  return POCKET_COLORS[NUMBER_DATA[number]!.color]
}

export function landingRotation(pocket: number, fullRotations = 5): number {
  const index = WHEEL_ORDER.indexOf(pocket)
  if (index < 0) return fullRotations * 360
  return fullRotations * 360 + (360 - index * POCKET_ANGLE - POCKET_ANGLE / 2)
}

export { POCKET_ANGLE }
