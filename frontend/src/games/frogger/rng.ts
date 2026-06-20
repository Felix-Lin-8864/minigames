/** Deterministic PRNG for procedural world generation. */
export function hashSeed(...values: number[]): number {
  let seed = 0x811c9dc5
  for (const value of values) {
    seed ^= value | 0
    seed = Math.imul(seed, 0x01000193)
  }
  return seed >>> 0
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function randBool(rng: () => number, probability = 0.5): boolean {
  return rng() < probability
}

export function randWeightedInt(
  rng: () => number,
  options: readonly { value: number; weight: number }[],
): number {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = rng() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) return option.value
  }
  return options[options.length - 1].value
}
