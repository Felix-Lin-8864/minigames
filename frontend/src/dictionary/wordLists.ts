import type { WordDictionary } from './wordDictionary'

export function partitionWordsByLength(
  dictionary: WordDictionary,
  validLengths: readonly number[],
): Record<number, Set<string>> {
  const lengthsSet = new Set(validLengths)
  const result: Record<number, Set<string>> = {}

  for (const word of dictionary) {
    const upper = word.toUpperCase()
    const len = upper.length
    if (!lengthsSet.has(len)) continue

    let bucket = result[len]
    if (!bucket) {
      bucket = new Set()
      result[len] = bucket
    }
    bucket.add(upper)
  }

  return result
}
