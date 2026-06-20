import {
  CARD_VALUE_KEYS,
  HANDS_PER_SHOE,
  SHOE_SIZE,
  type CardValueKey,
} from './constants'
import {
  createInitialRemainingCounts,
  hiLoValue,
  rankToValueKey,
} from './cards'
import { shuffleShoePool } from './shuffle'
import type { Card, ShoeState } from './types'

export type { ShoeState } from './types'

export function createShoe(random?: () => number): ShoeState {
  const queue = shuffleShoePool(random)
  return {
    queue,
    discardPile: [],
    handsCompleted: 0,
    remainingByValue: createInitialRemainingCounts(),
    runningCount: 0,
  }
}

export function reshuffleShoe(_shoe: ShoeState, random?: () => number): ShoeState {
  return createShoe(random)
}

export function totalRemaining(shoe: ShoeState): number {
  return CARD_VALUE_KEYS.reduce((sum, key) => sum + shoe.remainingByValue[key], 0)
}

export function decksRemaining(shoe: ShoeState): number {
  return totalRemaining(shoe) / 52
}

export function trueCount(shoe: ShoeState): number {
  const decks = decksRemaining(shoe)
  if (decks <= 0) return 0
  return runningCountFromDiscard(shoe) / decks
}

export function cardProbabilities(shoe: ShoeState): Record<CardValueKey, number> {
  const total = totalRemaining(shoe)
  const probs = {} as Record<CardValueKey, number>
  for (const key of CARD_VALUE_KEYS) {
    probs[key] = total > 0 ? (shoe.remainingByValue[key] / total) * 100 : 0
  }
  return probs
}

function trackRevealedCard(shoe: ShoeState, card: Card): void {
  const key = rankToValueKey(card.rank)
  shoe.remainingByValue[key] = Math.max(0, shoe.remainingByValue[key] - 1)
  shoe.runningCount += hiLoValue(card.rank)
}

/** Sum Hi-Lo values for every face-up card dealt this shoe era. */
export function runningCountFromDiscard(shoe: ShoeState): number {
  let count = 0
  for (const card of shoe.discardPile) {
    if (card.faceUp) {
      count += hiLoValue(card.rank)
    }
  }
  return count
}

export function syncRunningCount(shoe: ShoeState): void {
  shoe.runningCount = runningCountFromDiscard(shoe)
}

/** Deal one card from the front of the queue. Card is face-up unless specified. */
export function dealCard(shoe: ShoeState, faceUp = true): Card {
  const card = shoe.queue.shift()
  if (!card) {
    throw new Error('Shoe is empty — reshuffle required before dealing')
  }
  const dealt: Card = { ...card, faceUp }
  shoe.discardPile.push(dealt)
  if (faceUp) {
    trackRevealedCard(shoe, dealt)
  }
  return dealt
}

/** Reveal a face-down card and update tracking/counts. */
export function revealCard(shoe: ShoeState, card: Card): Card {
  if (card.faceUp) return card
  const revealed: Card = { ...card, faceUp: true }
  const discardIndex = shoe.discardPile.findIndex(
    (c) => c.suit === card.suit && c.rank === card.rank && !c.faceUp,
  )
  if (discardIndex >= 0) {
    shoe.discardPile[discardIndex] = revealed
  }
  trackRevealedCard(shoe, revealed)
  return revealed
}

/** Mark a completed hand; reshuffle when the counter reaches HANDS_PER_SHOE. */
export function completeHand(
  shoe: ShoeState,
  random?: () => number,
): { shoe: ShoeState; reshuffled: boolean } {
  const handsCompleted = shoe.handsCompleted + 1
  if (handsCompleted >= HANDS_PER_SHOE) {
    return { shoe: createShoe(random), reshuffled: true }
  }
  // Preserve the full shoe era (discard pile, counts, queue) — only advance the hand counter.
  syncRunningCount(shoe)
  return {
    shoe: {
      queue: shoe.queue,
      discardPile: shoe.discardPile,
      remainingByValue: shoe.remainingByValue,
      runningCount: shoe.runningCount,
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

export function shoeSnapshot(shoe: ShoeState) {
  const runningCount = runningCountFromDiscard(shoe)
  return {
    queueLength: shoe.queue.length,
    discardCount: shoe.discardPile.length,
    handsCompleted: shoe.handsCompleted,
    totalRemaining: totalRemaining(shoe),
    remainingByValue: { ...shoe.remainingByValue },
    probabilities: cardProbabilities(shoe),
    runningCount,
    trueCount: trueCount(shoe),
  }
}

export function assertShoeIntegrity(shoe: ShoeState): void {
  const inQueue = shoe.queue.length
  const inDiscard = shoe.discardPile.length
  if (inQueue + inDiscard !== SHOE_SIZE) {
    throw new Error(`Shoe card count mismatch: ${inQueue + inDiscard} !== ${SHOE_SIZE}`)
  }
}
