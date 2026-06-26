import { buildShoePool } from './pool'
import type { Card } from './types'

/**
 * Fisher–Yates shuffle. This is the only module that should call Math.random()
 * for card-game randomness at shoe creation.
 */
export function fisherYatesShuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]!
    arr[j] = tmp!
  }
  return arr
}

export function shuffleShoePool(random: () => number = Math.random): Card[] {
  return fisherYatesShuffle(buildShoePool(), random)
}
