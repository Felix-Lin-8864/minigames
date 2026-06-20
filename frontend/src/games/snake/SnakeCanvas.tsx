import { useEffect, useRef } from 'react'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_GAP,
  CELL_RADIUS,
  CELL_SIZE,
  COLORS,
  GOLDEN_FOOD_POINTS,
  GRID_COLS,
  GRID_ROWS,
} from './constants'
import type { Pellet, SnakeSnapshot } from './types'

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

function cellToPixel(col: number, row: number) {
  return {
    x: col * CELL_SIZE + CELL_GAP / 2,
    y: row * CELL_SIZE + CELL_GAP / 2,
    size: CELL_SIZE - CELL_GAP,
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1

  for (let col = 0; col <= GRID_COLS; col++) {
    const x = col * CELL_SIZE + 0.5
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.stroke()
  }

  for (let row = 0; row <= GRID_ROWS; row++) {
    const y = row * CELL_SIZE + 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_WIDTH, y)
    ctx.stroke()
  }
}

function drawMapWalls(ctx: CanvasRenderingContext2D, walls: SnakeSnapshot['walls']) {
  for (const wall of walls) {
    const { x, y, size } = cellToPixel(wall.col, wall.row)

    ctx.fillStyle = COLORS.mapWall
    drawRoundedRect(ctx, x, y, size, size, CELL_RADIUS)
    ctx.fill()

    ctx.strokeStyle = COLORS.mapWallBorder
    ctx.lineWidth = 1
    drawRoundedRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, CELL_RADIUS - 1)
    ctx.stroke()
  }
}

function drawPellet(ctx: CanvasRenderingContext2D, pellet: Pellet) {
  const { x, y, size } = cellToPixel(pellet.col, pellet.row)
  const centerX = x + size / 2
  const centerY = y + size / 2

  switch (pellet.type) {
    case 'normal': {
      const radius = size * 0.3
      ctx.fillStyle = COLORS.pelletNormalGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = COLORS.pelletNormal
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'golden': {
      const radius = size * 0.36
      ctx.fillStyle = COLORS.pelletGoldenGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = COLORS.pelletGolden
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fef3c7'
      ctx.font = 'bold 10px "Fredoka", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(GOLDEN_FOOD_POINTS), centerX, centerY + 0.5)
      break
    }
    case 'shrink': {
      const radius = size * 0.28
      ctx.fillStyle = COLORS.pelletShrinkGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = COLORS.pelletShrink
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#f3e8ff'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(centerX - radius * 0.55, centerY)
      ctx.lineTo(centerX + radius * 0.55, centerY)
      ctx.stroke()
      break
    }
    case 'red': {
      const radius = size * 0.32
      ctx.fillStyle = COLORS.pelletRedGlow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = COLORS.pelletRed
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#fecaca'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - radius * 0.45)
      ctx.lineTo(centerX, centerY + radius * 0.45)
      ctx.moveTo(centerX - radius * 0.45, centerY)
      ctx.lineTo(centerX + radius * 0.45, centerY)
      ctx.stroke()
      break
    }
  }
}

function drawSnake(ctx: CanvasRenderingContext2D, snapshot: SnakeSnapshot) {
  const headColor = snapshot.snakeIsRed ? COLORS.snakeHeadRed : COLORS.snakeHead
  const bodyColor = snapshot.snakeIsRed ? COLORS.snakeBodyRed : COLORS.snakeBody
  const bodyAltColor = snapshot.snakeIsRed ? COLORS.snakeBodyRedAlt : COLORS.snakeBodyAlt

  snapshot.snake.forEach((segment, index) => {
    const { x, y, size } = cellToPixel(segment.col, segment.row)
    const isHead = index === 0

    ctx.fillStyle = isHead ? headColor : index % 2 === 0 ? bodyColor : bodyAltColor
    drawRoundedRect(ctx, x, y, size, size, isHead ? CELL_RADIUS + 1 : CELL_RADIUS)
    ctx.fill()

    if (isHead) {
      const eyeSize = Math.max(2, size * 0.12)
      const offset = size * 0.22
      let leftEyeX = x + offset
      let leftEyeY = y + offset
      let rightEyeX = x + size - offset - eyeSize
      let rightEyeY = y + offset

      switch (snapshot.direction) {
        case 'down':
          leftEyeY = y + size - offset - eyeSize
          rightEyeY = leftEyeY
          break
        case 'left':
          leftEyeX = x + offset
          rightEyeX = leftEyeX
          leftEyeY = y + offset
          rightEyeY = y + size - offset - eyeSize
          break
        case 'right':
          leftEyeX = x + size - offset - eyeSize
          rightEyeX = leftEyeX
          leftEyeY = y + offset
          rightEyeY = y + size - offset - eyeSize
          break
      }

      ctx.fillStyle = COLORS.snakeEye
      ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize)
      ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize)
    }
  })
}

function drawIdleOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(10, 18, 16, 0.72)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = '#ecfdf5'
  ctx.font = '600 22px "Fredoka", "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Press Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8)

  ctx.fillStyle = '#94a89e'
  ctx.font = '14px "Inter", sans-serif'
  ctx.fillText('or Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 18)
}

function drawGameOverOverlay(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(10, 18, 16, 0.78)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = '#ecfdf5'
  ctx.font = '600 24px "Fredoka", "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16)

  ctx.fillStyle = '#94a89e'
  ctx.font = '15px "Inter", sans-serif'
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12)

  ctx.fillStyle = '#94a89e'
  ctx.font = '13px "Inter", sans-serif'
  ctx.fillText('Press Restart or Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36)
}

interface SnakeCanvasProps {
  snapshot: SnakeSnapshot
}

export function SnakeCanvas({ snapshot }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawGrid(ctx)
    drawMapWalls(ctx, snapshot.walls)
    for (const pellet of snapshot.pellets) {
      drawPellet(ctx, pellet)
    }
    drawSnake(ctx, snapshot)

    if (snapshot.status === 'idle') {
      drawIdleOverlay(ctx)
    } else if (snapshot.status === 'gameover') {
      drawGameOverOverlay(ctx, snapshot.score)
    }
  }, [snapshot])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }}
    />
  )
}
