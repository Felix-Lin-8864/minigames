import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { WordDictionaryContext } from './WordDictionaryContext'
import { loadWordDictionary, type WordDictionary } from './wordDictionary'

interface WordDictionaryProviderProps {
  children: ReactNode
}

export function WordDictionaryProvider({ children }: WordDictionaryProviderProps) {
  const [dictionary, setDictionary] = useState<WordDictionary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadWordDictionary()
      .then((dict) => {
        if (!cancelled) {
          setDictionary(dict)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dictionary')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ dictionary, loading, error }),
    [dictionary, loading, error],
  )

  return (
    <WordDictionaryContext.Provider value={value}>
      {children}
    </WordDictionaryContext.Provider>
  )
}
