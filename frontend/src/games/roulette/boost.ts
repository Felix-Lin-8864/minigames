/** Tadpoles spent on a boost — equal to the boost amount (and the winnings multiplier). */
export function getBoostTadpoleCost(boostAmount: number): number {
  if (!Number.isFinite(boostAmount) || boostAmount <= 0) return 0
  return Math.floor(boostAmount)
}
