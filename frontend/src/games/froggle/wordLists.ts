import { partitionWordsByLength } from '../../dictionary/wordLists'
import type { WordDictionary } from '../../dictionary/wordDictionary'
import type { FroggleWordLists, WordLength } from './types'

const VALID_LENGTHS = new Set<WordLength>([5, 6, 7, 8])

export function partitionWordLists(dictionary: WordDictionary): FroggleWordLists {
  const byLength = partitionWordsByLength(dictionary, [...VALID_LENGTHS])

  return {
    words5: [...(byLength[5] ?? [])],
    words6: [...(byLength[6] ?? [])],
    words7: [...(byLength[7] ?? [])],
    words8: [...(byLength[8] ?? [])],
  }
}

export function getWordListForLength(
  lists: FroggleWordLists,
  wordLength: WordLength,
): string[] {
  switch (wordLength) {
    case 5:
      return lists.words5
    case 6:
      return lists.words6
    case 7:
      return lists.words7
    case 8:
      return lists.words8
  }
}

export function isWordLength(value: number): value is WordLength {
  return VALID_LENGTHS.has(value as WordLength)
}
