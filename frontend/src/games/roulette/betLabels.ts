import { betZoneKey, type Bet } from './bets'

const OUTSIDE_LABELS: Partial<Record<Bet['type'], string>> = {
  red: 'Red',
  black: 'Black',
  odd: 'Odd',
  even: 'Even',
  low: '1–18',
  high: '19–36',
  dozen1: '1st 12',
  dozen2: '2nd 12',
  dozen3: '3rd 12',
  column1: 'Column 1',
  column2: 'Column 2',
  column3: 'Column 3',
}

const TYPE_PREFIX: Partial<Record<Bet['type'], string>> = {
  straight: 'Straight',
  split: 'Split',
  street: 'Street',
  corner: 'Corner',
  sixline: 'Six-line',
}

function sortedNumbers(numbers: number[]): number[] {
  return [...numbers].sort((a, b) => a - b)
}

export function formatBetSummary(bet: Bet): string {
  const outside = OUTSIDE_LABELS[bet.type]
  if (outside) return outside

  const nums = sortedNumbers(bet.numbers).join('–')
  const prefix = TYPE_PREFIX[bet.type]
  return prefix ? `${prefix} ${nums}` : nums
}

export interface AggregatedBet {
  zoneKey: string
  bet: Bet
  total: number
}

export function aggregatePendingBets(bets: Bet[]): AggregatedBet[] {
  const map = new Map<string, AggregatedBet>()
  for (const bet of bets) {
    const zoneKey = betZoneKey(bet)
    const existing = map.get(zoneKey)
    if (existing) {
      existing.total += bet.amount
    } else {
      map.set(zoneKey, { zoneKey, bet, total: bet.amount })
    }
  }
  return [...map.values()]
}
