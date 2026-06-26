import { SHOE_SIZE } from './constants'
import { shuffleShoePool } from './shuffle'
import type { Card, ShoeState } from './types'

export type { ShoeState } from './types'

export function createShoe(random?: () => number): ShoeState {
  return {
    queue: shuffleShoePool(random),
    discardPile: [],
    handsCompleted: 0,
  }
}

export function reshuffleShoe(_shoe: ShoeState, random?: () => number): ShoeState {
  return createShoe(random)
}

/** Deal one card from the front of the queue. Card is face-up unless specified. */
export function dealCard(shoe: ShoeState, faceUp = true): Card {
  const card = shoe.queue.shift()
  if (!card) {
    throw new Error('Shoe is empty — reshuffle required before dealing')
  }
  const dealt: Card = { ...card, faceUp }
  shoe.discardPile.push(dealt)
  return dealt
}

/** Mark a completed hand; reshuffle when the counter reaches handsPerShoe. */
export function completeHand(
  shoe: ShoeState,
  handsPerShoe: number,
  random?: () => number,
): { shoe: ShoeState; reshuffled: boolean } {
  const handsCompleted = shoe.handsCompleted + 1
  if (handsCompleted >= handsPerShoe) {
    return { shoe: createShoe(random), reshuffled: true }
  }
  return {
    shoe: {
      queue: shoe.queue,
      discardPile: shoe.discardPile,
      handsCompleted,
    },
    reshuffled: false,
  }
}

/** True when a completed shoe era just ended and a fresh queue replaced the discard pile. */
export function didShoeJustReshuffle(
  previousDiscardCount: number | null,
  nextDiscardCount: number,
): boolean {
  return previousDiscardCount !== null && previousDiscardCount > 0 && nextDiscardCount === 0
}

export function assertShoeIntegrity(shoe: ShoeState): void {
  const inQueue = shoe.queue.length
  const inDiscard = shoe.discardPile.length
  if (inQueue + inDiscard !== SHOE_SIZE) {
    throw new Error(`Shoe card count mismatch: ${inQueue + inDiscard} !== ${SHOE_SIZE}`)
  }
}
