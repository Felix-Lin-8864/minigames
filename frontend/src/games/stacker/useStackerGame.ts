import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { MAX_FRAME_DELTA_MS } from './constants'
import { createInitialState, stackerReducer, toSnapshot } from './gameLogic'

export function useStackerGame() {
  const [state, dispatch] = useReducer(stackerReducer, undefined, createInitialState)
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

  const drop = useCallback(() => {
    if (stateRef.current.status !== 'playing' || stateRef.current.isGameOver) return
    dispatch({ type: 'drop' })
  }, [])

  useEffect(() => {
    let frameId = 0
    let lastTime = performance.now()

    function loop(now: number) {
      const rawDelta = now - lastTime
      lastTime = now
      const delta = Math.min(rawDelta, MAX_FRAME_DELTA_MS)

      if (stateRef.current.status === 'playing') {
        dispatch({ type: 'tick', delta })
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Spacebar') {
        if (stateRef.current.status === 'playing' && !stateRef.current.isGameOver) {
          event.preventDefault()
          dispatch({ type: 'drop' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const snapshot = useMemo(() => toSnapshot(state), [state])

  return { snapshot, start, restart, drop }
}
