import { MIN_BET } from './constants'

/** Tadpoles spent on a boost — equal to the boost amount (and the winnings multiplier). */
export function getBoostTadpoleCost(boostAmount: number): number {
  if (!Number.isFinite(boostAmount) || boostAmount < MIN_BET) return 0
  return Math.floor(boostAmount)
}
