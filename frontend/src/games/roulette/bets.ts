import {
  BLACK_POCKETS,
  COLUMN1_POCKETS,
  COLUMN2_POCKETS,
  COLUMN3_POCKETS,
  DOZEN1_POCKETS,
  DOZEN2_POCKETS,
  DOZEN3_POCKETS,
  EVEN_POCKETS,
  HIGH_POCKETS,
  LOW_POCKETS,
  NUMBER_DATA,
  ODD_POCKETS,
  RED_POCKETS,
} from './numberData'
import {
  VALID_CORNERS,
  VALID_SIX_LINES,
  VALID_SPLITS,
  VALID_STREETS,
} from './grid'

export type BetType =
  | 'straight'
  | 'split'
  | 'street'
  | 'corner'
  | 'sixline'
  | 'red'
  | 'black'
  | 'odd'
  | 'even'
  | 'high'
  | 'low'
  | 'dozen1'
  | 'dozen2'
  | 'dozen3'
  | 'column1'
  | 'column2'
  | 'column3'

export interface Bet {
  type: BetType
  numbers: number[]
  amount: number
}

export const ODDS: Record<BetType, number> = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  sixline: 5,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  high: 1,
  low: 1,
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  column1: 2,
  column2: 2,
  column3: 2,
}

const INSIDE_BET_TYPES = new Set<BetType>([
  'straight',
  'split',
  'street',
  'corner',
  'sixline',
])

const OUTSIDE_BET_TYPES = new Set<BetType>([
  'red',
  'black',
  'odd',
  'even',
  'high',
  'low',
  'dozen1',
  'dozen2',
  'dozen3',
  'column1',
  'column2',
  'column3',
])

const OUTSIDE_POCKETS: Record<string, number[]> = {
  red: RED_POCKETS,
  black: BLACK_POCKETS,
  odd: ODD_POCKETS,
  even: EVEN_POCKETS,
  low: LOW_POCKETS,
  high: HIGH_POCKETS,
  dozen1: DOZEN1_POCKETS,
  dozen2: DOZEN2_POCKETS,
  dozen3: DOZEN3_POCKETS,
  column1: COLUMN1_POCKETS,
  column2: COLUMN2_POCKETS,
  column3: COLUMN3_POCKETS,
}

function sortedKey(numbers: number[]): string {
  return [...numbers].sort((a, b) => a - b).join('-')
}

export function isInsideBetType(type: BetType): boolean {
  return INSIDE_BET_TYPES.has(type)
}

export function isOutsideBetType(type: BetType): boolean {
  return OUTSIDE_BET_TYPES.has(type)
}

export function isValidAdjacency(type: BetType, numbers: number[]): boolean {
  const key = sortedKey(numbers)
  switch (type) {
    case 'straight':
      return numbers.length === 1 && numbers[0]! >= 0 && numbers[0]! <= 36
    case 'split':
      return numbers.length === 2 && VALID_SPLITS.has(key)
    case 'street':
      return numbers.length === 3 && VALID_STREETS.has(key)
    case 'corner':
      return numbers.length === 4 && VALID_CORNERS.has(key)
    case 'sixline':
      return numbers.length === 6 && VALID_SIX_LINES.has(key)
    default:
      return isOutsideBetType(type)
  }
}

export function createOutsideBet(type: BetType, amount: number): Bet {
  const numbers = OUTSIDE_POCKETS[type]
  if (!numbers) {
    throw new Error(`Not an outside bet type: ${type}`)
  }
  return { type, numbers: [...numbers], amount }
}

export function createInsideBet(
  type: BetType,
  numbers: number[],
  amount: number,
): Bet | null {
  if (!isValidAdjacency(type, numbers)) return null
  return { type, numbers: [...numbers].sort((a, b) => a - b), amount }
}

function betWins(bet: Bet, spinResult: number): boolean {
  if (isInsideBetType(bet.type)) {
    return bet.numbers.includes(spinResult)
  }

  if (spinResult === 0) return false

  const data = NUMBER_DATA[spinResult]!
  switch (bet.type) {
    case 'red':
      return data.color === 'red'
    case 'black':
      return data.color === 'black'
    case 'odd':
      return data.parity === 'odd'
    case 'even':
      return data.parity === 'even'
    case 'low':
      return data.highLow === 'low'
    case 'high':
      return data.highLow === 'high'
    case 'dozen1':
      return data.dozen === 'first'
    case 'dozen2':
      return data.dozen === 'second'
    case 'dozen3':
      return data.dozen === 'third'
    case 'column1':
      return data.column === 1
    case 'column2':
      return data.column === 2
    case 'column3':
      return data.column === 3
    default:
      return false
  }
}

export function resolveBet(bet: Bet, spinResult: number): number {
  if (!betWins(bet, spinResult)) return 0
  return bet.amount * (ODDS[bet.type] + 1)
}

export interface BetOutcome {
  bet: Bet
  payout: number
  won: boolean
}

export interface SpinResolution {
  outcomes: BetOutcome[]
  totalPayout: number
  totalStaked: number
  net: number
}

export function resolveSpin(bets: Bet[], spinResult: number): SpinResolution {
  const outcomes: BetOutcome[] = bets.map((bet) => {
    const payout = resolveBet(bet, spinResult)
    return { bet, payout, won: payout > 0 }
  })
  const totalPayout = outcomes.reduce((sum, o) => sum + o.payout, 0)
  const totalStaked = bets.reduce((sum, b) => sum + b.amount, 0)
  return {
    outcomes,
    totalPayout,
    totalStaked,
    net: totalPayout - totalStaked,
  }
}

export function betZoneKey(bet: Bet): string {
  return `${bet.type}:${sortedKey(bet.numbers)}`
}
