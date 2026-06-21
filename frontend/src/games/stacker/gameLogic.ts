import {
  BASE_LAYER_WIDTH,
  BASE_SPEED,
  MIN_LAYER_WIDTH,
  PERFECT_FLASH_DURATION_MS,
  TRIM_FALL_DURATION_MS,
  activeLayerBounds,
  scrollOffsetForLayerCount,
  speedForSuccessfulLayers,
} from './constants'
import type {
  Layer,
  LastDropResult,
  StackerAction,
  StackerCoreState,
  StackerSnapshot,
  StackerState,
} from './types'

export function computeOverlapWidth(activeLayer: Layer, belowLayer: Layer): number {
  const leftA = activeLayer.xOffset - activeLayer.width / 2
  const rightA = activeLayer.xOffset + activeLayer.width / 2
  const leftB = belowLayer.xOffset - belowLayer.width / 2
  const rightB = belowLayer.xOffset + belowLayer.width / 2
  return Math.max(0, Math.min(rightA, rightB) - Math.max(leftA, leftB))
}

export function calculatePoints(overlapWidth: number, layerWidth: number): number {
  return overlapWidth === layerWidth ? 5 : 2
}

export function scoreToTadpoles(finalScore: number): number {
  return finalScore / 4
}

function overlapCenterX(activeLayer: Layer, belowLayer: Layer, overlapWidth: number): number {
  const leftA = activeLayer.xOffset - activeLayer.width / 2
  const leftB = belowLayer.xOffset - belowLayer.width / 2
  const overlapLeft = Math.max(leftA, leftB)
  return overlapLeft + overlapWidth / 2
}

function buildTrimResult(
  activeLayer: Layer,
  belowLayer: Layer,
  overlapWidth: number,
): Pick<LastDropResult, 'trimmedSide' | 'trimPiece'> {
  if (overlapWidth >= activeLayer.width) {
    return { trimmedSide: null, trimPiece: null }
  }

  const leftA = activeLayer.xOffset - activeLayer.width / 2
  const rightA = activeLayer.xOffset + activeLayer.width / 2
  const leftB = belowLayer.xOffset - belowLayer.width / 2
  const rightB = belowLayer.xOffset + belowLayer.width / 2
  const overlapLeft = Math.max(leftA, leftB)
  const overlapRight = Math.min(rightA, rightB)

  if (leftA < overlapLeft) {
    const trimWidth = overlapLeft - leftA
    return {
      trimmedSide: 'left',
      trimPiece: { xOffset: leftA + trimWidth / 2, width: trimWidth },
    }
  }

  if (rightA > overlapRight) {
    const trimWidth = rightA - overlapRight
    return {
      trimmedSide: 'right',
      trimPiece: { xOffset: overlapRight + trimWidth / 2, width: trimWidth },
    }
  }

  return { trimmedSide: null, trimPiece: null }
}

export function dropLayer(
  state: StackerCoreState,
  activeLayer: Layer,
): { newState: StackerCoreState; overlapWidth: number; isPerfect: boolean } {
  const belowLayer = state.layers[state.layers.length - 1]
  const overlapWidth = computeOverlapWidth(activeLayer, belowLayer)
  const isPerfect = overlapWidth === activeLayer.width

  if (overlapWidth < MIN_LAYER_WIDTH) {
    return {
      newState: { ...state, isGameOver: true },
      overlapWidth,
      isPerfect: false,
    }
  }

  const lockedLayer: Layer = {
    width: overlapWidth,
    xOffset: overlapCenterX(activeLayer, belowLayer, overlapWidth),
  }
  const newLayers = [...state.layers, lockedLayer]
  const successfulLayers = newLayers.length - 1
  const points = calculatePoints(overlapWidth, activeLayer.width)

  return {
    newState: {
      layers: newLayers,
      currentWidth: overlapWidth,
      speed: speedForSuccessfulLayers(successfulLayers),
      score: state.score + points,
      isGameOver: false,
    },
    overlapWidth,
    isPerfect,
  }
}

export function createInitialState(): StackerState {
  const baseLayer: Layer = { width: BASE_LAYER_WIDTH, xOffset: 0 }
  return {
    status: 'idle',
    layers: [baseLayer],
    currentWidth: BASE_LAYER_WIDTH,
    speed: BASE_SPEED,
    score: 0,
    isGameOver: false,
    activeXOffset: 0,
    activeDirection: 1,
    successfulLayers: 0,
    lastDrop: null,
    trimAnimation: null,
    perfectFlash: null,
  }
}

function toCoreState(state: StackerState): StackerCoreState {
  return {
    layers: state.layers,
    currentWidth: state.currentWidth,
    speed: state.speed,
    score: state.score,
    isGameOver: state.isGameOver,
  }
}

function tickAnimations(state: StackerState, delta: number): StackerState {
  let trimAnimation = state.trimAnimation
  let perfectFlash = state.perfectFlash

  if (trimAnimation) {
    const elapsedMs = trimAnimation.elapsedMs + delta
    trimAnimation = elapsedMs >= TRIM_FALL_DURATION_MS ? null : { ...trimAnimation, elapsedMs }
  }

  if (perfectFlash) {
    const elapsedMs = perfectFlash.elapsedMs + delta
    perfectFlash =
      elapsedMs >= PERFECT_FLASH_DURATION_MS ? null : { ...perfectFlash, elapsedMs }
  }

  if (trimAnimation === state.trimAnimation && perfectFlash === state.perfectFlash) {
    return state
  }

  return { ...state, trimAnimation, perfectFlash }
}

function tickMovement(state: StackerState, delta: number): StackerState {
  if (state.status !== 'playing' || state.isGameOver) return state

  const bounds = activeLayerBounds(state.currentWidth)
  let nextOffset = state.activeXOffset + state.activeDirection * state.speed * delta
  let nextDirection = state.activeDirection

  if (nextOffset >= bounds.max) {
    nextOffset = bounds.max
    nextDirection = -1
  } else if (nextOffset <= bounds.min) {
    nextOffset = bounds.min
    nextDirection = 1
  }

  if (nextOffset === state.activeXOffset && nextDirection === state.activeDirection) {
    return state
  }

  return {
    ...state,
    activeXOffset: nextOffset,
    activeDirection: nextDirection,
  }
}

function handleDrop(state: StackerState): StackerState {
  if (state.status !== 'playing' || state.isGameOver) return state

  const activeLayer: Layer = {
    width: state.currentWidth,
    xOffset: state.activeXOffset,
  }
  const belowLayer = state.layers[state.layers.length - 1]
  const { newState, overlapWidth, isPerfect } = dropLayer(toCoreState(state), activeLayer)

  if (newState.isGameOver) {
    return {
      ...state,
      isGameOver: true,
      status: 'gameover',
      lastDrop: {
        trimmedSide: null,
        trimPiece: null,
        isPerfect: false,
        pointsAwarded: 0,
      },
    }
  }

  const trimInfo = buildTrimResult(activeLayer, belowLayer, overlapWidth)
  const pointsAwarded = calculatePoints(overlapWidth, activeLayer.width)
  const successfulLayers = newState.layers.length - 1
  const bounds = activeLayerBounds(newState.currentWidth)

  return {
    ...state,
    ...newState,
    successfulLayers,
    activeXOffset: Math.max(bounds.min, Math.min(bounds.max, state.activeXOffset)),
    activeDirection: state.activeDirection,
    lastDrop: {
      ...trimInfo,
      isPerfect,
      pointsAwarded,
    },
    trimAnimation: trimInfo.trimPiece
      ? { trimPiece: trimInfo.trimPiece, elapsedMs: 0 }
      : null,
    perfectFlash: isPerfect
      ? { layerIndex: newState.layers.length - 1, elapsedMs: 0 }
      : null,
  }
}

export function stackerReducer(state: StackerState, action: StackerAction): StackerState {
  switch (action.type) {
    case 'start':
    case 'restart':
      return { ...createInitialState(), status: 'playing' }
    case 'tick': {
      const animated = tickAnimations(state, action.delta)
      return tickMovement(animated, action.delta)
    }
    case 'drop':
      return handleDrop(state)
    default:
      return state
  }
}

export function toSnapshot(state: StackerState): StackerSnapshot {
  return {
    status: state.isGameOver ? 'gameover' : state.status,
    layers: state.layers,
    currentWidth: state.currentWidth,
    speed: state.speed,
    score: state.score,
    activeXOffset: state.activeXOffset,
    activeDirection: state.activeDirection,
    scrollOffset: scrollOffsetForLayerCount(state.layers.length),
    lastDrop: state.lastDrop,
    trimAnimation: state.trimAnimation,
    perfectFlash: state.perfectFlash,
  }
}
