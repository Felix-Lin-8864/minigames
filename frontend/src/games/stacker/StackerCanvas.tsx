import { useEffect, useRef } from 'react'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  GRID_CELL_SIZE,
  LAYER_HEIGHT,
  PERFECT_FLASH_DURATION_MS,
  PLAY_WIDTH,
  TRIM_FALL_DURATION_MS,
  activeLayerScreenY,
  stackLayerScreenY,
} from './constants'
import type { Layer, StackerSnapshot } from './types'

interface StackerCanvasProps {
  snapshot: StackerSnapshot
  onDrop: () => void
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function layerRect(layer: Layer, y: number) {
  const centerX = PLAY_WIDTH / 2
  return {
    x: centerX + layer.xOffset - layer.width / 2,
    y,
    width: layer.width,
    height: LAYER_HEIGHT - 4,
  }
}

function drawLilyPadLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  y: number,
  options: { fill: string; stroke?: string; alpha?: number } = { fill: COLORS.lilypad },
) {
  const { x, width, height } = layerRect(layer, y)
  ctx.save()
  ctx.globalAlpha = options.alpha ?? 1
  ctx.fillStyle = options.fill
  drawRoundedRect(ctx, x, y, width, height, 8)
  ctx.fill()

  if (options.stroke) {
    ctx.strokeStyle = options.stroke
    ctx.lineWidth = 2
    drawRoundedRect(ctx, x + 1, y + 1, width - 2, height - 2, 7)
    ctx.stroke()
  }

  const notchX = x + width / 2
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(notchX, y + 4)
  ctx.lineTo(notchX, y + height - 4)
  ctx.stroke()
  ctx.restore()
}

function drawPerfectRipple(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  y: number,
  progress: number,
) {
  const { x, width, height } = layerRect(layer, y)
  const cx = x + width / 2
  const cy = y + height / 2
  const maxRadius = Math.max(width, height) * 0.8
  const radius = maxRadius * progress
  const alpha = 1 - progress

  ctx.save()
  ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.9})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1

  for (let x = 0; x <= PLAY_WIDTH; x += GRID_CELL_SIZE) {
    const lineX = x + 0.5
    ctx.beginPath()
    ctx.moveTo(lineX, 0)
    ctx.lineTo(lineX, CANVAS_HEIGHT)
    ctx.stroke()
  }

  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_CELL_SIZE) {
    const lineY = y + 0.5
    ctx.beginPath()
    ctx.moveTo(0, lineY)
    ctx.lineTo(PLAY_WIDTH, lineY)
    ctx.stroke()
  }
}

export function StackerCanvas({ snapshot, onDrop }: StackerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = PLAY_WIDTH / 2
    const { layers, perfectFlash, trimAnimation } = snapshot
    const layerCount = layers.length

    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    drawGrid(ctx)

    ctx.fillStyle = COLORS.platform
    drawRoundedRect(ctx, 8, CANVAS_HEIGHT - 16, PLAY_WIDTH - 16, 12, 6)
    ctx.fill()

    const layerY = (index: number) => stackLayerScreenY(index, layerCount)

    for (let i = 0; i < layers.length; i++) {
      const isBase = i === 0
      const y = layerY(i)
      drawLilyPadLayer(ctx, layers[i], y, {
        fill: isBase ? COLORS.lilypadAlt : i % 2 === 0 ? COLORS.lilypad : COLORS.lilypadAlt,
      })

      if (perfectFlash && perfectFlash.layerIndex === i) {
        const progress = perfectFlash.elapsedMs / PERFECT_FLASH_DURATION_MS
        drawLilyPadLayer(ctx, layers[i], y, {
          fill: COLORS.lilypadPerfect,
          stroke: COLORS.lilypadPerfect,
        })
        drawPerfectRipple(ctx, layers[i], y, progress)
      }
    }

    if (trimAnimation) {
      const fallProgress = Math.min(1, trimAnimation.elapsedMs / TRIM_FALL_DURATION_MS)
      const fallDistance = fallProgress * LAYER_HEIGHT * 2
      const trimY = layerY(layers.length - 1) + fallDistance
      drawLilyPadLayer(ctx, trimAnimation.trimPiece, trimY, {
        fill: COLORS.trimPiece,
        alpha: 1 - fallProgress * 0.6,
      })
    }

    if (snapshot.status === 'playing') {
      const activeLayer: Layer = {
        width: snapshot.currentWidth,
        xOffset: snapshot.activeXOffset,
      }
      const activeY = activeLayerScreenY(layerCount)
      drawLilyPadLayer(ctx, activeLayer, activeY, {
        fill: COLORS.lilypadActive,
        stroke: COLORS.lilypadLeaf,
      })
    }

    if (snapshot.status === 'gameover') {
      ctx.save()
      ctx.fillStyle = 'rgba(10, 18, 16, 0.55)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = COLORS.text
      ctx.font = 'bold 28px "Fredoka", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over', centerX, CANVAS_HEIGHT / 2 - 12)
      ctx.restore()
    }
  }, [snapshot])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={onDrop}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: CANVAS_WIDTH,
        cursor: snapshot.status === 'playing' ? 'pointer' : 'default',
        borderRadius: 8,
      }}
      aria-label="Stacker play area. Click or press space to drop the layer."
    />
  )
}
