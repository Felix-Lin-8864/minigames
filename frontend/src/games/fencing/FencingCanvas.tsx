import { useEffect, useRef } from 'react'
import {
  ARENA_LANES,
  AVATAR_CROUCH_HEIGHT,
  AVATAR_STANDING_HEIGHT,
  AVATAR_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  COLORS,
  GROUND_Y,
  JUMP_APEX,
  JUMP_DURATION_MS,
} from './constants'
import type { FencerState, FencingSnapshot } from './types'

interface FencingCanvasProps {
  snapshot: FencingSnapshot
}

function laneToX(lane: number): number {
  return lane * CELL_SIZE + CELL_SIZE / 2
}

function jumpOffset(fencer: FencerState): number {
  if (fencer.jumpElapsedMs <= 0) return 0
  const t = Math.min(fencer.jumpElapsedMs / JUMP_DURATION_MS, 1)
  return -JUMP_APEX * Math.sin(Math.PI * t)
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

function drawFencer(
  ctx: CanvasRenderingContext2D,
  fencer: FencerState,
  isPlayer: boolean,
  flash: boolean,
) {
  const centerX = laneToX(fencer.x)
  const isCrouching = fencer.stance === 'crouching'
  const height = isCrouching ? AVATAR_CROUCH_HEIGHT : AVATAR_STANDING_HEIGHT
  const y = GROUND_Y - height + jumpOffset(fencer)
  const x = centerX - AVATAR_WIDTH / 2

  const bodyColor = isPlayer ? COLORS.player : COLORS.bot
  const accentColor = isPlayer ? COLORS.playerAccent : COLORS.botAccent

  if (flash) {
    ctx.save()
    ctx.shadowColor = COLORS.touchFlash
    ctx.shadowBlur = 20
    drawRoundedRect(ctx, x - 4, y - 4, AVATAR_WIDTH + 8, height + 8, 8)
    ctx.fillStyle = COLORS.touchFlash
    ctx.fill()
    ctx.restore()
  }

  drawRoundedRect(ctx, x, y, AVATAR_WIDTH, height, 6)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 2
  ctx.stroke()

  const armExtend =
    fencer.attackType !== null
      ? (fencer.lungeProgress / 0.5) * (isPlayer ? 18 : -18)
      : 0
  const armY = y + (isCrouching ? 8 : 16)
  const armX = isPlayer ? x + AVATAR_WIDTH - 2 : x + 2

  ctx.beginPath()
  ctx.moveTo(armX, armY)
  ctx.lineTo(armX + armExtend, armY - 4)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, y + 10, 8, 0, Math.PI * 2)
  ctx.fillStyle = accentColor
  ctx.fill()

  if (fencer.attackType === 'low') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(x, y + height - 10, AVATAR_WIDTH, 6)
  } else if (fencer.attackType === 'high') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(x, y + 4, AVATAR_WIDTH, 10)
  }
}

function drawArena(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = COLORS.floor
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)

  ctx.strokeStyle = COLORS.floorLine
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, GROUND_Y)
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
  ctx.stroke()

  for (let lane = 0; lane <= ARENA_LANES; lane++) {
    const x = lane * CELL_SIZE
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.moveTo(x, GROUND_Y)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.stroke()
  }

  ctx.fillStyle = COLORS.wall
  ctx.fillRect(0, 0, 8, CANVAS_HEIGHT)
  ctx.fillRect(CANVAS_WIDTH - 8, 0, 8, CANVAS_HEIGHT)
}

export function FencingCanvas({ snapshot }: FencingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawArena(ctx)

    const flashActive = snapshot.touchFlashMs > 0
    const flashPlayer = flashActive && snapshot.lastScorer === 'player'
    const flashBot = flashActive && snapshot.lastScorer === 'bot'

    drawFencer(ctx, snapshot.player, true, flashPlayer)
    drawFencer(ctx, snapshot.bot, false, flashBot)

    if (snapshot.status === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = COLORS.scoreText
      ctx.font = 'bold 18px "Fredoka", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Press Start to begin', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    }
  }, [snapshot])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', width: '100%', maxWidth: CANVAS_WIDTH, borderRadius: 8 }}
    />
  )
}
