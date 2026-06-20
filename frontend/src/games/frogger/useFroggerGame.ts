import { useCallback, useEffect, useReducer, useRef } from 'react'
import { MAX_FRAME_DELTA_MS, MOVE_COOLDOWN_MS } from './constants'
import { createInitialState, froggerReducer, toSnapshot } from './gameLogic'
import type { FroggerSnapshot } from './types'

export function useFroggerGame() {
  const [state, dispatch] = useReducer(froggerReducer, undefined, createInitialState)
  const stateRef = useRef(state)
  const lastMoveRef = useRef(0)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const tryMove = useCallback((dCol: number, dRow: number) => {
    if (stateRef.current.status !== 'playing') return

    const now = performance.now()
    if (now - lastMoveRef.current < MOVE_COOLDOWN_MS) return

    lastMoveRef.current = now
    dispatch({ type: 'move', dCol, dRow })
  }, [])

  const start = useCallback(() => {
    lastMoveRef.current = 0
    dispatch({ type: 'start' })
  }, [])

  const restart = useCallback(() => {
    lastMoveRef.current = 0
    dispatch({ type: 'restart' })
  }, [])

  const move = tryMove

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
      if (stateRef.current.status !== 'playing') return

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          tryMove(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          tryMove(0, 1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault()
          tryMove(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault()
          tryMove(1, 0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tryMove])

  const snapshot: FroggerSnapshot = toSnapshot(state)

  return { snapshot, start, restart, move }
}
