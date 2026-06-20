import { createContext } from 'react'
import type { WordDictionary } from './wordDictionary'

export interface WordDictionaryContextValue {
  dictionary: WordDictionary | null
  loading: boolean
  error: string | null
}

export const WordDictionaryContext = createContext<WordDictionaryContextValue>({
  dictionary: null,
  loading: true,
  error: null,
})
