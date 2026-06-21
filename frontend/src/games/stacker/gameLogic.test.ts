import { describe, expect, it } from 'vitest'
import { BASE_SPEED, MIN_LAYER_WIDTH, LAYER_HEIGHT, ROWS_ABOVE_ACTIVE, activeLayerScreenY, speedForSuccessfulLayers, stackLayerScreenY, scrollOffsetForLayerCount } from './constants'
import {
  calculatePoints,
  computeOverlapWidth,
  createInitialState,
  dropLayer,
  scoreToTadpoles,
  stackerReducer,
} from './gameLogic'
import type { Layer, StackerCoreState } from './types'

function coreState(overrides: Partial<StackerCoreState> = {}): StackerCoreState {
  return {
    layers: [{ width: 300, xOffset: 0 }],
    currentWidth: 300,
    speed: BASE_SPEED,
    score: 0,
    isGameOver: false,
    ...overrides,
  }
}

describe('scoreToTadpoles', () => {
  it('returns score divided by 4 with no rounding', () => {
    expect(scoreToTadpoles(30)).toBe(7.5)
    expect(scoreToTadpoles(45)).toBe(11.25)
    expect(scoreToTadpoles(95)).toBe(23.75)
    expect(scoreToTadpoles(0)).toBe(0)
  })
})

describe('calculatePoints', () => {
  it('returns 2 for partial overlap and 5 for perfect overlap', () => {
    expect(calculatePoints(150, 300)).toBe(2)
    expect(calculatePoints(299, 300)).toBe(2)
    expect(calculatePoints(300, 300)).toBe(5)
  })

  it('does not vary based on streaks or prior placements', () => {
    expect(calculatePoints(100, 200)).toBe(2)
    expect(calculatePoints(200, 200)).toBe(5)
    expect(calculatePoints(50, 100)).toBe(2)
  })
})

describe('speedForSuccessfulLayers', () => {
  it('increases by 5% every 5 layers with no cap', () => {
    expect(speedForSuccessfulLayers(0)).toBeCloseTo(BASE_SPEED)
    expect(speedForSuccessfulLayers(4)).toBeCloseTo(BASE_SPEED)
    expect(speedForSuccessfulLayers(5)).toBeCloseTo(BASE_SPEED * 1.05)
    expect(speedForSuccessfulLayers(10)).toBeCloseTo(BASE_SPEED * 1.05 ** 2)
    expect(speedForSuccessfulLayers(25)).toBeCloseTo(BASE_SPEED * 1.05 ** 5)
    expect(speedForSuccessfulLayers(100)).toBeCloseTo(BASE_SPEED * 1.05 ** 20)
  })
})

describe('computeOverlapWidth', () => {
  it('computes full overlap when aligned', () => {
    const a: Layer = { width: 200, xOffset: 0 }
    const b: Layer = { width: 200, xOffset: 0 }
    expect(computeOverlapWidth(a, b)).toBe(200)
  })

  it('computes partial overlap when offset', () => {
    const a: Layer = { width: 200, xOffset: 50 }
    const b: Layer = { width: 200, xOffset: 0 }
    expect(computeOverlapWidth(a, b)).toBe(150)
  })

  it('returns zero when layers miss', () => {
    const a: Layer = { width: 100, xOffset: 200 }
    const b: Layer = { width: 100, xOffset: -200 }
    expect(computeOverlapWidth(a, b)).toBe(0)
  })
})

describe('dropLayer', () => {
  it('ends game on zero overlap', () => {
    const state = coreState()
    const active: Layer = { width: 100, xOffset: 300 }
    const { newState, overlapWidth } = dropLayer(state, active)

    expect(overlapWidth).toBe(0)
    expect(newState.isGameOver).toBe(true)
    expect(newState.score).toBe(0)
  })

  it('ends game when overlap falls below minimum playable threshold', () => {
    const state = coreState({ layers: [{ width: 300, xOffset: 0 }] })
    const active: Layer = { width: 100, xOffset: 200 }
    const overlap = computeOverlapWidth(active, state.layers[0])
    expect(overlap).toBeLessThan(MIN_LAYER_WIDTH)

    const { newState } = dropLayer(state, active)
    expect(newState.isGameOver).toBe(true)
  })

  it('continues play on partial overlap above threshold', () => {
    const state = coreState()
    const active: Layer = { width: 200, xOffset: 100 }
    const { newState, overlapWidth, isPerfect } = dropLayer(state, active)

    expect(overlapWidth).toBeGreaterThanOrEqual(MIN_LAYER_WIDTH)
    expect(newState.isGameOver).toBe(false)
    expect(isPerfect).toBe(false)
    expect(newState.score).toBe(2)
    expect(newState.currentWidth).toBe(overlapWidth)
    expect(newState.layers).toHaveLength(2)
  })

  it('awards perfect points on full overlap', () => {
    const state = coreState()
    const active: Layer = { width: 300, xOffset: 0 }
    const { newState, isPerfect } = dropLayer(state, active)

    expect(isPerfect).toBe(true)
    expect(newState.score).toBe(5)
  })

  it('trims width on left offset', () => {
    const state = coreState()
    const active: Layer = { width: 200, xOffset: -100 }
    const { newState, overlapWidth } = dropLayer(state, active)

    expect(overlapWidth).toBe(150)
    expect(newState.currentWidth).toBe(150)
    expect(newState.layers[1].xOffset).toBe(-75)
  })

  it('trims width on right offset', () => {
    const state = coreState()
    const active: Layer = { width: 200, xOffset: 100 }
    const { newState, overlapWidth } = dropLayer(state, active)

    expect(overlapWidth).toBe(150)
    expect(newState.layers[1].xOffset).toBe(75)
  })

  it('updates speed after every 5 successful layers', () => {
    let state = coreState()
    for (let i = 0; i < 5; i++) {
      const active: Layer = { width: state.currentWidth, xOffset: 0 }
      const result = dropLayer(state, active)
      state = result.newState
    }
    expect(state.speed).toBeCloseTo(BASE_SPEED * 1.05)
    expect(state.score).toBe(25)
  })
})

describe('stack layout scroll', () => {
  it('keeps one row gap between the active layer and stack top', () => {
    const layerCount = 6
    const topStackY = stackLayerScreenY(layerCount - 1, layerCount)
    const activeY = activeLayerScreenY(layerCount)
    expect(topStackY - (activeY + LAYER_HEIGHT)).toBe(LAYER_HEIGHT)
  })

  it('does not scroll while there is still room for four rows above the active layer', () => {
    expect(scrollOffsetForLayerCount(1)).toBe(0)
    expect(scrollOffsetForLayerCount(9)).toBe(0)
  })

  it('pins the active layer with four empty rows above once the stack grows tall', () => {
    const layerCount = 11
    const activeY = activeLayerScreenY(layerCount)
    expect(activeY).toBe(ROWS_ABOVE_ACTIVE * LAYER_HEIGHT)
    expect(scrollOffsetForLayerCount(layerCount)).toBeGreaterThan(0)
  })
})

describe('stackerReducer', () => {
  it('starts in playing state', () => {
    const state = stackerReducer(createInitialState(), { type: 'start' })
    expect(state.status).toBe('playing')
    expect(state.layers).toHaveLength(1)
  })

  it('ends game on missed drop', () => {
    let state = stackerReducer(createInitialState(), { type: 'start' })
    state = { ...state, activeXOffset: 400 }
    state = stackerReducer(state, { type: 'drop' })

    expect(state.status).toBe('gameover')
    expect(state.isGameOver).toBe(true)
  })
})
