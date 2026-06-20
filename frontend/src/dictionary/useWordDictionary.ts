import { useContext } from 'react'
import { WordDictionaryContext } from './WordDictionaryContext'

export function useWordDictionary() {
  return useContext(WordDictionaryContext)
}
