export function roundToNearestMultiple(value: number, step: number): number {
  if (step <= 0) return value
  return Math.round(value / step) * step
}

export function snapRequiredBetAmount(raw: string, min: number, step: number): number {
  const trimmed = raw.trim()
  if (trimmed === '') return min

  const value = Number(trimmed)
  if (!Number.isFinite(value)) return min

  return Math.max(min, roundToNearestMultiple(value, step))
}

export function snapOptionalBetAmount(raw: string, min: number, step: number): number {
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === '0') return 0

  const value = Number(trimmed)
  if (!Number.isFinite(value)) return 0

  const rounded = roundToNearestMultiple(value, step)
  if (rounded < min) return 0
  return rounded
}

export function formatOptionalBetAmount(amount: number): string {
  return amount > 0 ? String(amount) : ''
}
