export const DOUBLE_TAP_WINDOW_MS = 300
export const BOT_REACTION_MS = 500
export const BOT_REACTION_MIN_MS = 400
export const BOT_REACTION_MAX_MS = 600

export const TOUCHES_TO_WIN = 5
export const TOUCH_PAUSE_MS = 1000
export const TOUCH_FLASH_MS = 400

export const STEP_SIZE = 1
export const MIN_SEPARATION = 2
export const LUNGE_DISTANCE = 3
export const LUNGE_RANGE = 1
export const LUNGE_DURATION_MS = 250
export const LUNGE_CONTACT_PROGRESS = 0.5
export const JUMP_DURATION_MS = 400

export const ARENA_LANES = 20
export const PLAYER_START_X = 4
export const BOT_START_X = ARENA_LANES - 5

export const FLAWLESS_WIN_BONUS = 15

export const MAX_FRAME_DELTA_MS = 32

export const CELL_SIZE = 28
export const CANVAS_WIDTH = ARENA_LANES * CELL_SIZE
export const CANVAS_HEIGHT = 200
export const GROUND_Y = CANVAS_HEIGHT - 40
export const AVATAR_WIDTH = 24
export const AVATAR_STANDING_HEIGHT = 56
export const AVATAR_CROUCH_HEIGHT = 32
export const JUMP_APEX = 28

export const ATTACK_RANGE = LUNGE_DISTANCE + LUNGE_RANGE

export const COLORS = {
  background: '#1a2e24',
  floor: '#2d4a3a',
  floorLine: '#3d6b52',
  wall: '#0f1a14',
  player: '#60a5fa',
  playerAccent: '#3b82f6',
  bot: '#f87171',
  botAccent: '#ef4444',
  touchFlash: 'rgba(251, 191, 36, 0.6)',
  scoreText: '#e2e8f0',
}
