/** Tadpoles are stored in half-unit increments so 3:2 blackjack pays correctly on odd bets. */
export function normalizeTadpoles(amount: number): number {
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 2) / 2
}

export function formatTadpoles(amount: number): string {
  const normalized = normalizeTadpoles(amount)
  if (Number.isInteger(normalized)) {
    return normalized.toLocaleString()
  }
  return normalized.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

export function formatTadpolesFixed(amount: number, decimals = 2): string {
  const normalized = normalizeTadpoles(amount)
  return normalized.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
