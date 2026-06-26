import type { WordDictionary } from '../../dictionary/wordDictionary'
import type { FroggleWordLists, WordLength } from './types'

const VALID_LENGTHS = new Set<WordLength>([5, 6, 7, 8])

export function partitionWordLists(dictionary: WordDictionary): FroggleWordLists {
  const words5: string[] = []
  const words6: string[] = []
  const words7: string[] = []
  const words8: string[] = []

  for (const word of dictionary) {
    const upper = word.toUpperCase()
    switch (upper.length) {
      case 5:
        words5.push(upper)
        break
      case 6:
        words6.push(upper)
        break
      case 7:
        words7.push(upper)
        break
      case 8:
        words8.push(upper)
        break
    }
  }

  return { words5, words6, words7, words8 }
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
