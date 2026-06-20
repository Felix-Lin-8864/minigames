import { WHEEL_POCKETS } from './constants'

/** Pick a random pocket to receive the winnings multiplier. */
export function pickBoostedPocket(random: () => number = Math.random): number {
  return Math.floor(random() * WHEEL_POCKETS)
}
