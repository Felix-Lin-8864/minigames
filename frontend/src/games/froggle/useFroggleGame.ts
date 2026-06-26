import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useWordDictionary } from '../../dictionary/useWordDictionary'
import { INVALID_MESSAGE_DURATION_MS } from './constants'
import { froggleReducer, maxGuessesForLength, toSnapshot } from './gameLogic'
import type { FroggleSnapshot, WordLength } from './types'
import { getWordListForLength, partitionWordLists } from './wordLists'

const DEFAULT_WORD_LENGTH: WordLength = 5

export function useFroggleGame() {
  const { dictionary, loading } = useWordDictionary()
  const wordLists = useMemo(
    () => (dictionary ? partitionWordLists(dictionary) : null),
    [dictionary],
  )

  const [state, dispatch] = useReducer(
    froggleReducer,
    undefined,
    () => ({
      guesses: [],
      results: [],
      keyboardState: {},
      guessesRemaining: maxGuessesForLength(DEFAULT_WORD_LENGTH),
      status: 'idle' as const,
      config: {
        wordLength: DEFAULT_WORD_LENGTH,
        wordList: [],
        targetWord: '',
        maxGuesses: maxGuessesForLength(DEFAULT_WORD_LENGTH),
      },
      currentGuess: '',
      invalidMessage: null,
      score: 0,
      forfeited: false,
    }),
  )

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const getActiveWordList = useCallback(
    (wordLength: WordLength) => {
      if (!wordLists) return []
      return getWordListForLength(wordLists, wordLength)
    },
    [wordLists],
  )

  const start = useCallback(() => {
    if (!wordLists) return
    const wordLength = stateRef.current.config.wordLength
    dispatch({
      type: 'start',
      wordLength,
      wordList: getWordListForLength(wordLists, wordLength),
    })
  }, [wordLists])

  const playAgain = useCallback(() => {
    if (!wordLists) return
    const wordLength = stateRef.current.config.wordLength
    dispatch({
      type: 'play_again',
      wordList: getWordListForLength(wordLists, wordLength),
    })
  }, [wordLists])

  const setWordLength = useCallback(
    (wordLength: WordLength) => {
      if (!wordLists) return
      dispatch({
        type: 'set_word_length',
        wordLength,
        wordList: getWordListForLength(wordLists, wordLength),
      })
    },
    [wordLists],
  )

  const typeLetter = useCallback((letter: string) => {
    dispatch({ type: 'type_letter', letter })
  }, [])

  const backspace = useCallback(() => {
    dispatch({ type: 'backspace' })
  }, [])

  const submitGuess = useCallback(() => {
    dispatch({ type: 'submit_guess' })
  }, [])

  const forfeit = useCallback(() => {
    dispatch({ type: 'forfeit' })
  }, [])

  useEffect(() => {
    if (!state.invalidMessage) return

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'clear_invalid_message' })
    }, INVALID_MESSAGE_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [state.invalidMessage])

  const snapshot: FroggleSnapshot = toSnapshot(state)

  return {
    snapshot,
    dictionaryReady: !loading && wordLists != null,
    start,
    playAgain,
    setWordLength,
    typeLetter,
    backspace,
    submitGuess,
    forfeit,
    getActiveWordList,
  }
}
