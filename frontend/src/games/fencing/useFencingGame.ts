import { useCallback, useEffect, useReducer, useRef } from 'react'
import { MAX_FRAME_DELTA_MS } from './constants'
import {
  createInitialState,
  fencingReducer,
  resolveRightArrowInput,
  toSnapshot,
} from './gameLogic'
import type { FencingAction, FencingSnapshot, FencingState } from './types'

function reducer(state: FencingState, action: FencingAction): FencingState {
  return fencingReducer(state, action)
}

export function useFencingGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const stateRef = useRef(state)
  const lastRightTapRef = useRef<number | null>(null)
  const downHeldRef = useRef(false)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const start = useCallback(() => {
    lastRightTapRef.current = null
    downHeldRef.current = false
    dispatch({ type: 'start' })
  }, [])

  const restart = useCallback(() => {
    lastRightTapRef.current = null
    downHeldRef.current = false
    dispatch({ type: 'restart' })
  }, [])

  const clearRightTap = useCallback(() => {
    lastRightTapRef.current = null
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
    function canAcceptInput(): boolean {
      const current = stateRef.current
      return current.status === 'playing' && current.phase === 'active'
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!canAcceptInput()) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          clearRightTap()
          dispatch({ type: 'moveLeft' })
          break
        case 'ArrowRight': {
          event.preventDefault()
          const { intent, lastRightTap } = resolveRightArrowInput(
            performance.now(),
            lastRightTapRef.current,
          )
          lastRightTapRef.current = lastRightTap
          if (intent === 'lunge') {
            dispatch({ type: downHeldRef.current ? 'lungeLow' : 'lungeHigh' })
          } else {
            dispatch({ type: 'moveRight' })
          }
          break
        }
        case 'ArrowUp':
          event.preventDefault()
          clearRightTap()
          dispatch({ type: 'jump' })
          break
        case 'ArrowDown':
          event.preventDefault()
          clearRightTap()
          downHeldRef.current = true
          dispatch({ type: 'crouchStart' })
          break
        default:
          if (event.key !== 'ArrowRight') {
            clearRightTap()
          }
          break
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        downHeldRef.current = false
        if (stateRef.current.status === 'playing') {
          dispatch({ type: 'crouchEnd' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [clearRightTap])

  const snapshot: FencingSnapshot = toSnapshot(state)

  return { snapshot, start, restart }
}
