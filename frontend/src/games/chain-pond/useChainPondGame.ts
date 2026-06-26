import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useWordDictionary } from '../../dictionary/useWordDictionary'
import { INVALID_MESSAGE_DURATION_MS } from './constants'
import {
  chainPondReducer,
  createIdleState,
  partitionChainPondWords,
  toSnapshot,
  type WordsByLength,
} from './gameLogic'
import type { ChainPondSnapshot } from './types'

export function useChainPondGame() {
  const { dictionary, loading } = useWordDictionary()
  const wordsByLength = useMemo<WordsByLength | null>(
    () => (dictionary ? partitionChainPondWords(dictionary) : null),
    [dictionary],
  )

  const [state, dispatch] = useReducer(chainPondReducer, undefined, createIdleState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const start = useCallback(() => {
    if (!wordsByLength) return
    dispatch({ type: 'start', wordsByLength })
  }, [wordsByLength])

  const playAgain = useCallback(() => {
    if (!wordsByLength) return
    dispatch({ type: 'play_again', wordsByLength })
  }, [wordsByLength])

  const submitWord = useCallback(
    (word: string) => {
      if (!wordsByLength) return
      dispatch({ type: 'submit', word, wordsByLength })
    },
    [wordsByLength],
  )

  useEffect(() => {
    if (state.status !== 'playing') return

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'tick', deltaSeconds: 0.1 })
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [state.status])

  useEffect(() => {
    if (!state.invalidMessage) return

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'clear_invalid_message' })
    }, INVALID_MESSAGE_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [state.invalidMessage])

  const snapshot: ChainPondSnapshot = toSnapshot(state)

  return {
    snapshot,
    invalidMessage: state.invalidMessage,
    dictionaryReady: !loading && wordsByLength != null,
    start,
    playAgain,
    submitWord,
  }
}
