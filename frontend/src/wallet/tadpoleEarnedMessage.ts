import { formatTadpoles } from './tadpoleAmount'

export function tadpoleEarnedMessage(amount: number): string {
  if (amount <= 0) return 'No tadpoles earned this round.'
  const formatted = formatTadpoles(amount)
  const label = amount === 1 ? 'tadpole' : 'tadpoles'
  return `You earned ${formatted} ${label}!`
}
