import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useWordDictionary } from '../../dictionary/useWordDictionary'
import {
  anagramsReducer,
  createInitialState,
  toSnapshot,
  validateWord,
} from './gameLogic'
import type { AnagramsConfig, AnagramsSnapshot } from './types'

export function useAnagramsGame() {
  const { dictionary } = useWordDictionary()
  const [state, dispatch] = useReducer(anagramsReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const setConfig = useCallback((config: Partial<AnagramsConfig>) => {
    dispatch({ type: 'set_config', config })
  }, [])

  const start = useCallback(() => {
    dispatch({ type: 'start' })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'restart' })
  }, [])

  const clearMessage = useCallback(() => {
    dispatch({ type: 'clear_message' })
  }, [])

  const submitWord = useCallback(
    (rawWord: string) => {
      const current = stateRef.current
      if (current.status !== 'playing' || !dictionary) return

      const result = validateWord(
        rawWord,
        current.letters,
        current.config.mode,
        current.usedWords,
        dictionary,
      )

      if (!result.valid) {
        dispatch({
          type: 'submit_word',
          word: rawWord,
          isValid: false,
          error: result.error,
        })
        return
      }

      dispatch({
        type: 'submit_word',
        word: result.word,
        isValid: true,
        points: result.points,
      })
    },
    [dictionary],
  )

  useEffect(() => {
    if (state.status !== 'playing') return

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'tick', deltaMs: 100 })
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [state.status])

  const snapshot: AnagramsSnapshot = toSnapshot(state)

  return {
    snapshot,
    setConfig,
    start,
    restart,
    submitWord,
    clearMessage,
    dictionaryReady: dictionary != null,
  }
}
