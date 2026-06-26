import { useEffect, useState } from 'react'
import {
  fetchWordDefinitions,
  type WordDefinition,
  type WordDefinitionLookup,
} from '../../dictionary/fetchWordDefinitions'

export type WordDefinitionsStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface WordDefinitionsResult {
  status: WordDefinitionsStatus
  phonetic: string | null
  definitions: WordDefinition[]
}

const idleResult: WordDefinitionsResult = {
  status: 'idle',
  phonetic: null,
  definitions: [],
}

function toResult(lookup: WordDefinitionLookup): WordDefinitionsResult {
  if (lookup.definitions.length === 0) {
    return { status: 'empty', phonetic: lookup.phonetic, definitions: [] }
  }

  return {
    status: 'ready',
    phonetic: lookup.phonetic,
    definitions: lookup.definitions,
  }
}

export function useWordDefinitions(word: string, enabled: boolean): WordDefinitionsResult {
  const [result, setResult] = useState<WordDefinitionsResult>(idleResult)

  useEffect(() => {
    if (!enabled || !word) {
      setResult(idleResult)
      return
    }

    let cancelled = false
    setResult({ status: 'loading', phonetic: null, definitions: [] })

    void fetchWordDefinitions(word)
      .then((lookup) => {
        if (!cancelled) {
          setResult(toResult(lookup))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ status: 'error', phonetic: null, definitions: [] })
        }
      })

    return () => {
      cancelled = true
    }
  }, [word, enabled])

  return result
}
