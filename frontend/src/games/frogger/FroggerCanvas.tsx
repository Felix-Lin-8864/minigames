import { useEffect, useRef } from 'react'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  COLORS,
  COLS,
  TILE_GAP,
  TILE_RADIUS,
  VIEWPORT_ROWS,
  VISIBLE_COL_MAX,
  VISIBLE_COL_MIN,
  isLogicalColVisible,
  laneTypeForWorldRow,
  logicalColToCanvasX,
  logicalXToCanvasCenterX,
  rowToCanvasY,
  type LaneType,
} from './constants'
import type { FroggerSnapshot } from './types'

interface TileBounds {
  x: number
  y: number
  size: number
  inner: number
}

function getTileBounds(logicalCol: number, row: number): TileBounds {
  const pad = TILE_GAP / 2
  const x = logicalColToCanvasX(logicalCol)
  const y = rowToCanvasY(row) - TILE_GAP / 2 + pad
  const size = CELL_SIZE - TILE_GAP
  return { x, y, size, inner: size - 4 }
}

function wrapCol(col: number): number {
  return ((col % COLS) + COLS) % COLS
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

function tileFill(kind: LaneType, col: number, worldRow: number): string {
  const checker = (col + worldRow) % 2 === 0

  switch (kind) {
    case 'start':
    case 'safe':
      return checker ? COLORS.grassLight : COLORS.grassLightAlt
    case 'median':
      return checker ? COLORS.grassLight : COLORS.grassLightAlt
    case 'road':
      return checker ? COLORS.road : COLORS.roadAlt
    case 'river':
      return checker ? COLORS.river : COLORS.riverAlt
  }
}

function drawGrassDetail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = 'rgba(74, 222, 128, 0.2)'
  ctx.beginPath()
  ctx.arc(x + size * 0.3, y + size * 0.55, 2, 0, Math.PI * 2)
  ctx.arc(x + size * 0.55, y + size * 0.45, 2, 0, Math.PI * 2)
  ctx.arc(x + size * 0.75, y + size * 0.6, 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawRoadDetail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = COLORS.roadMark
  ctx.fillRect(x + size / 2 - 1, y + size * 0.2, 2, size * 0.15)
  ctx.fillRect(x + size / 2 - 1, y + size * 0.65, 2, size * 0.15)
}

function drawRiverDetail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  col: number,
) {
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  const offset = col % 2 === 0 ? 0 : 4
  ctx.moveTo(x + 4, y + size / 2 + offset)
  ctx.lineTo(x + size - 4, y + size / 2 + offset)
  ctx.stroke()
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  logicalCol: number,
  row: number,
  worldRow: number,
) {
  const { x, y, size } = getTileBounds(logicalCol, row)
  const kind = laneTypeForWorldRow(worldRow)

  ctx.fillStyle = tileFill(kind, logicalCol, worldRow)
  drawRoundedRect(ctx, x, y, size, size, TILE_RADIUS)
  ctx.fill()

  ctx.strokeStyle = COLORS.tileBorder
  ctx.lineWidth = 1
  ctx.stroke()

  if (kind === 'start' || kind === 'median' || kind === 'safe') {
    drawGrassDetail(ctx, x, y, size)
  }
  if (kind === 'road') drawRoadDetail(ctx, x, y, size)
  if (kind === 'river') drawRiverDetail(ctx, x, y, size, logicalCol)
}

function drawTiles(ctx: CanvasRenderingContext2D, snapshot: FroggerSnapshot) {
  ctx.fillStyle = COLORS.tileGap
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  for (let row = 0; row < VIEWPORT_ROWS; row++) {
    const worldRow = snapshot.rowWorldRows[row] ?? 0
    for (let col = VISIBLE_COL_MIN; col <= VISIBLE_COL_MAX; col++) {
      drawTile(ctx, col, row, worldRow)
    }
  }
}

function drawLogBody(
  ctx: CanvasRenderingContext2D,
  logicalX: number,
  widthInCols: number,
  y: number,
  h: number,
) {
  const x = logicalColToCanvasX(logicalX) + 1
  const w = widthInCols * CELL_SIZE - TILE_GAP - 2

  ctx.fillStyle = COLORS.log
  ctx.fillRect(x, y, w, h)

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

  for (let slot = 1; slot < widthInCols; slot++) {
    const lineX = logicalColToCanvasX(logicalX + slot)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.beginPath()
    ctx.moveTo(lineX, y + 2)
    ctx.lineTo(lineX, y + h - 2)
    ctx.stroke()
  }

  ctx.fillStyle = COLORS.logLight
  ctx.fillRect(x + 4, y + h / 2 - 1, w - 8, 2)
}

function drawLogs(ctx: CanvasRenderingContext2D, snapshot: FroggerSnapshot) {
  snapshot.logs.forEach((log) => {
    const y = rowToCanvasY(log.row) + 7
    const h = CELL_SIZE - TILE_GAP - 14
    const endX = log.x + log.width

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.clip()

    if (endX <= COLS) {
      const x = logicalColToCanvasX(log.x) + 1
      const w = log.width * CELL_SIZE - TILE_GAP - 2
      if (x + w >= 0 && x <= CANVAS_WIDTH) {
        drawLogBody(ctx, log.x, log.width, y, h)
      }
    } else {
      const firstWidth = COLS - log.x
      const secondWidth = log.width - firstWidth
      drawLogBody(ctx, log.x, firstWidth, y, h)
      drawLogBody(ctx, 0, secondWidth, y, h)
    }

    ctx.restore()
  })
}

function drawCars(ctx: CanvasRenderingContext2D, snapshot: FroggerSnapshot) {
  snapshot.cars.forEach((car) => {
    const x = logicalColToCanvasX(car.x) + 2
    const y = rowToCanvasY(car.row) + 5
    const w = car.width * CELL_SIZE - TILE_GAP - 4
    const h = CELL_SIZE - TILE_GAP - 10

    if (x + w < 0 || x > CANVAS_WIDTH) return

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.clip()

    ctx.fillStyle = car.variant === 'truck' ? COLORS.truck : COLORS.car
    drawRoundedRect(ctx, x, y, w, h, 4)
    ctx.fill()

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = car.variant === 'truck' ? '#fdba74' : COLORS.carCab
    const cabW = car.variant === 'truck' ? w * 0.35 : w * 0.45
    const cabX = car.direction === 1 ? x + w - cabW - 2 : x + 2
    drawRoundedRect(ctx, cabX, y + 3, cabW, h - 6, 3)
    ctx.fill()

    ctx.restore()
  })
}

function drawFrog(ctx: CanvasRenderingContext2D, snapshot: FroggerSnapshot) {
  const { frog } = snapshot
  const logicalCol = wrapCol(Math.round(frog.x))
  if (!isLogicalColVisible(logicalCol)) return

  const tile = getTileBounds(logicalCol, frog.row)
  const cx = logicalXToCanvasCenterX(frog.x)
  const cy = rowToCanvasY(frog.row) + (CELL_SIZE - TILE_GAP) / 2
  const r = tile.inner * 0.28

  ctx.fillStyle = 'rgba(74, 222, 128, 0.15)'
  drawRoundedRect(ctx, tile.x + 2, tile.y + 2, tile.size - 4, tile.size - 4, 4)
  ctx.fill()

  ctx.fillStyle = COLORS.frog
  ctx.beginPath()
  ctx.ellipse(cx, cy + 2, r, r * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx - r * 0.55, cy - r * 0.5, r * 0.35, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.55, cy - r * 0.5, r * 0.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#0a1210'
  ctx.beginPath()
  ctx.arc(cx - r * 0.55, cy - r * 0.5, r * 0.14, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.55, cy - r * 0.5, r * 0.14, 0, Math.PI * 2)
  ctx.fill()
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  subtitle: string,
) {
  ctx.fillStyle = 'rgba(10, 18, 16, 0.75)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = COLORS.text
  ctx.textAlign = 'center'
  ctx.font = '600 28px Fredoka, sans-serif'
  ctx.fillText(title, width / 2, height / 2 - 12)

  ctx.font = '400 14px Inter, sans-serif'
  ctx.fillStyle = '#94a89e'
  ctx.fillText(subtitle, width / 2, height / 2 + 20)
}

function render(ctx: CanvasRenderingContext2D, snapshot: FroggerSnapshot) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  drawTiles(ctx, snapshot)
  drawLogs(ctx, snapshot)
  drawCars(ctx, snapshot)

  if (snapshot.status === 'playing') {
    drawFrog(ctx, snapshot)
  }

  if (snapshot.status === 'idle') {
    drawOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 'Frogger', 'Press Start or Enter to hop in')
  }

  if (snapshot.status === 'gameover') {
    drawOverlay(
      ctx,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      'Game Over',
      `${snapshot.score} tiles — press Restart to try again`,
    )
  }
}

interface FroggerCanvasProps {
  snapshot: FroggerSnapshot
}

export function FroggerCanvas({ snapshot }: FroggerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    render(ctx, snapshot)
  }, [snapshot])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: CANVAS_WIDTH,
        height: 'auto',
        borderRadius: 12,
        border: '1px solid rgba(74, 222, 128, 0.2)',
        backgroundColor: COLORS.tileGap,
      }}
    />
  )
}
