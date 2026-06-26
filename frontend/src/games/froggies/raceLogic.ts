import {
  FINISH_POSITION,
  FROGS,
  MULTIPLIERS,
  SLOT_COUNTS,
  WIN_PROBABILITIES,
} from './constants'
import type { Bet, BetType, FrogColour, FrogPositions, RaceResult } from './types'

export function createInitialPositions(): FrogPositions {
  return {
    green: 0,
    blue: 0,
    red: 0,
    yellow: 0,
    purple: 0,
  }
}

export function getSlotCount(type: BetType): number {
  return SLOT_COUNTS[type]
}

export function getWinProbability(type: BetType): number {
  return WIN_PROBABILITIES[type]
}

export function getMultiplier(type: BetType): number {
  return MULTIPLIERS[type]
}

export function tickRace(
  positions: FrogPositions,
  random: () => number = Math.random,
): FrogPositions {
  const next = { ...positions }
  const frog = FROGS[Math.floor(random() * FROGS.length)]!
  next[frog] += 1
  return next
}

function createRandomTieBreaker(random: () => number) {
  const scores = new Map<FrogColour, number>()

  function score(frog: FrogColour): number {
    if (!scores.has(frog)) {
      scores.set(frog, random())
    }
    return scores.get(frog)!
  }

  return (a: FrogColour, b: FrogColour): number => score(b) - score(a)
}

function compareFrogs(
  a: FrogColour,
  b: FrogColour,
  positions: FrogPositions,
  tieBreak: (left: FrogColour, right: FrogColour) => number,
): number {
  const positionDiff = positions[b] - positions[a]
  if (positionDiff !== 0) return positionDiff
  return tieBreak(a, b)
}

export function resolveFinishOrder(
  positions: FrogPositions,
  random: () => number = Math.random,
): FrogColour[] {
  const tieBreak = createRandomTieBreaker(random)
  return [...FROGS].sort((a, b) => compareFrogs(a, b, positions, tieBreak))
}

export function evaluateBet(bet: Bet, result: RaceResult): number {
  const requiredLength = getSlotCount(bet.type)
  if (bet.selection.length !== requiredLength) return 0

  for (let i = 0; i < requiredLength; i += 1) {
    if (bet.selection[i] !== result.finishOrder[i]) return 0
  }

  return bet.amount * getMultiplier(bet.type)
}

export function runRace(random: () => number = Math.random): {
  tickHistory: FrogPositions[]
  finishOrder: FrogColour[]
} {
  let positions = createInitialPositions()
  const tickHistory: FrogPositions[] = []

  while (Math.max(...FROGS.map((frog) => positions[frog])) < FINISH_POSITION) {
    positions = tickRace(positions, random)
    tickHistory.push({ ...positions })
  }

  const finishOrder = resolveFinishOrder(positions, random)
  return { tickHistory, finishOrder }
}

export function buildBet(
  type: BetType,
  selection: FrogColour[],
  amount: number,
): Bet {
  return { type, selection, amount }
}
