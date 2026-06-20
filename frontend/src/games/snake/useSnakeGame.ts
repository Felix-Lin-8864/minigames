import { useCallback, useEffect, useReducer, useRef } from 'react'
import { createInitialState, snakeReducer, toSnapshot } from './gameLogic'
import type { Direction, SnakeSnapshot } from './types'

export function useSnakeGame() {
  const [state, dispatch] = useReducer(snakeReducer, undefined, createInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const start = useCallback(() => {
    dispatch({ type: 'start' })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'restart' })
  }, [])

  const setDirection = useCallback((direction: Direction) => {
    dispatch({ type: 'setDirection', direction })
  }, [])

  useEffect(() => {
    let timeoutId = 0

    function scheduleNextTick() {
      if (stateRef.current.status !== 'playing') return

      const tickMs = toSnapshot(stateRef.current).tickMs
      timeoutId = window.setTimeout(() => {
        dispatch({ type: 'tick' })
        scheduleNextTick()
      }, tickMs)
    }

    scheduleNextTick()
    return () => window.clearTimeout(timeoutId)
  }, [state.status, state.score])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const status = stateRef.current.status

      if (event.key === 'Enter') {
        if (status === 'idle') start()
        else if (status === 'gameover') restart()
        return
      }

      if (status !== 'playing') return

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          setDirection('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          setDirection('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault()
          setDirection('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault()
          setDirection('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [start, restart, setDirection])

  const snapshot: SnakeSnapshot = toSnapshot(state)

  return { snapshot, start, restart, setDirection }
}
