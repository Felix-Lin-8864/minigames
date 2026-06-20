import { WHEEL_POCKETS } from './constants'

/** Draw one pocket from the European wheel. Injectable random for tests. */
export function spinPocket(random: () => number = Math.random): number {
  return Math.floor(random() * WHEEL_POCKETS)
}
