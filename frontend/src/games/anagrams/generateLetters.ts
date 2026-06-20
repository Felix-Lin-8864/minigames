export const LETTER_WEIGHTS = {
  e: 12,
  a: 9,
  i: 9,
  o: 8,
  n: 6,
  r: 6,
  t: 6,
  l: 4,
  s: 4,
  u: 4,
  d: 4,
  g: 3,
  b: 2,
  c: 2,
  m: 2,
  p: 2,
  f: 2,
  h: 2,
  v: 2,
  w: 2,
  y: 2,
  k: 1,
  j: 1,
  x: 1,
  q: 1,
  z: 1,
} as const

export type Letter = keyof typeof LETTER_WEIGHTS

export const VOWELS: readonly Letter[] = ['a', 'e', 'i', 'o', 'u']

export const RARE_LETTERS: readonly Letter[] = ['j', 'q', 'x', 'z']

const ALL_LETTERS: readonly Letter[] = Object.keys(LETTER_WEIGHTS) as Letter[]

export const MIN_VOWELS = 2
export const MAX_RARE_LETTERS = 1

const MIN_COUNT = MIN_VOWELS
const MAX_COUNT = ALL_LETTERS.length

const VOWEL_SET = new Set<Letter>(VOWELS)
const RARE_LETTER_SET = new Set<Letter>(RARE_LETTERS)

type RandomFn = () => number

function isVowel(letter: Letter): boolean {
  return VOWEL_SET.has(letter)
}

function isRare(letter: Letter): boolean {
  return RARE_LETTER_SET.has(letter)
}

function shuffle<T>(items: readonly T[], random: RandomFn): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

function weightedPick(candidates: readonly Letter[], random: RandomFn): Letter {
  const totalWeight = candidates.reduce((sum, letter) => sum + LETTER_WEIGHTS[letter], 0)
  let roll = random() * totalWeight

  for (const letter of candidates) {
    roll -= LETTER_WEIGHTS[letter]
    if (roll <= 0) {
      return letter
    }
  }

  return candidates[candidates.length - 1]
}

function sampleWeightedWithoutReplacement(count: number, random: RandomFn): Letter[] {
  const available = new Set<Letter>(ALL_LETTERS)
  const result: Letter[] = []

  for (let i = 0; i < count; i++) {
    const pool = [...available]
    const letter = weightedPick(pool, random)
    result.push(letter)
    available.delete(letter)
  }

  return result
}

function enforceMinVowels(letters: readonly Letter[], random: RandomFn): Letter[] {
  const result = [...letters]
  const used = new Set<Letter>(result)

  while (result.filter(isVowel).length < MIN_VOWELS) {
    const consonantIndex = result.findIndex((letter) => !isVowel(letter))
    if (consonantIndex === -1) {
      break
    }

    const availableVowels = VOWELS.filter((vowel) => !used.has(vowel))
    if (availableVowels.length === 0) {
      break
    }

    const replacement = weightedPick(availableVowels, random)
    used.delete(result[consonantIndex])
    result[consonantIndex] = replacement
    used.add(replacement)
  }

  return result
}

function enforceRareLetterCap(letters: readonly Letter[], random: RandomFn): Letter[] {
  const result = [...letters]
  const used = new Set<Letter>(result)
  const rareIndices = result
    .map((letter, index) => (isRare(letter) ? index : -1))
    .filter((index) => index >= 0)

  if (rareIndices.length <= MAX_RARE_LETTERS) {
    return result
  }

  for (let i = MAX_RARE_LETTERS; i < rareIndices.length; i++) {
    const index = rareIndices[i]
    const available = ALL_LETTERS.filter((letter) => !used.has(letter) && !isRare(letter))
    if (available.length === 0) {
      break
    }

    const replacement = weightedPick(available, random)
    used.delete(result[index])
    result[index] = replacement
    used.add(replacement)
  }

  return result
}

function enforceConstraints(letters: readonly Letter[], random: RandomFn): Letter[] {
  let result = enforceMinVowels(letters, random)
  result = enforceRareLetterCap(result, random)
  result = enforceMinVowels(result, random)
  return result
}

/**
 * Draws `count` distinct letters using Scrabble-style frequency weights.
 * Sampling is without replacement. Enforces at least two vowels and at most
 * one rare letter (J, Q, X, Z) per draw.
 */
export function generateLetters(count: number = 6, random: RandomFn = Math.random): string[] {
  if (count < MIN_COUNT || count > MAX_COUNT) {
    throw new RangeError(`count must be between ${MIN_COUNT} and ${MAX_COUNT}, got ${count}`)
  }

  const sampled = sampleWeightedWithoutReplacement(count, random)
  const constrained = enforceConstraints(sampled, random)
  return shuffle(constrained, random)
}

/** Uniform without-replacement sampling, for statistical comparison in tests. */
export function generateUniformLetters(count: number, random: RandomFn = Math.random): string[] {
  const pool = shuffle(ALL_LETTERS, random)
  return pool.slice(0, count)
}

export function countVowels(letters: readonly string[]): number {
  return letters.filter((letter) => VOWEL_SET.has(letter as Letter)).length
}

export function countRareLetters(letters: readonly string[]): number {
  return letters.filter((letter) => RARE_LETTER_SET.has(letter as Letter)).length
}
