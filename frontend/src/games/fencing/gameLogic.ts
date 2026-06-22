import {
  ARENA_LANES,
  ATTACK_RANGE,
  BOT_REACTION_MAX_MS,
  BOT_REACTION_MIN_MS,
  BOT_START_X,
  DOUBLE_TAP_WINDOW_MS,
  FLAWLESS_WIN_BONUS,
  JUMP_DURATION_MS,
  LUNGE_CONTACT_PROGRESS,
  LUNGE_DISTANCE,
  LUNGE_DURATION_MS,
  LUNGE_RANGE,
  MIN_SEPARATION,
  PLAYER_START_X,
  STEP_SIZE,
  TOUCHES_TO_WIN,
  TOUCH_FLASH_MS,
  TOUCH_PAUSE_MS,
} from './constants'
import type {
  AttackType,
  BotPendingAction,
  FencerState,
  FencingAction,
  FencingSnapshot,
  FencingState,
  Scorer,
  Stance,
} from './types'

export type RandomFn = () => number

export function calculateScore(playerTouches: number, botTouches: number): number {
  const net = (playerTouches - botTouches) * 3
  const flawlessBonus =
    playerTouches === TOUCHES_TO_WIN && botTouches === 0 ? FLAWLESS_WIN_BONUS : 0
  return net + flawlessBonus
}

export function scoreToTadpoles(finalScore: number): number {
  return finalScore / 4
}

export function resolveRightArrowInput(
  timestamp: number,
  lastRightTap: number | null,
  windowMs: number = DOUBLE_TAP_WINDOW_MS,
): { intent: 'move' | 'lunge'; lastRightTap: number | null } {
  if (lastRightTap !== null && timestamp - lastRightTap <= windowMs) {
    return { intent: 'lunge', lastRightTap: null }
  }
  return { intent: 'move', lastRightTap: timestamp }
}

function isVulnerable(defenderStance: Stance, attackType: AttackType): boolean {
  if (attackType === 'high') {
    return defenderStance === 'standing' || defenderStance === 'jumping'
  }
  if (attackType === 'low') {
    return defenderStance === 'crouching'
  }
  return false
}

function lungeGap(attackerX: number, defenderX: number, attackerIsPlayer: boolean): number {
  return attackerIsPlayer ? defenderX - attackerX : attackerX - defenderX
}

export function resolveAttack(
  attacker: FencerState,
  defender: FencerState,
  attackType: AttackType,
  attackerIsPlayer: boolean,
): boolean {
  if (!attackType) return false
  if (attacker.stance === 'jumping') return false
  if (attacker.attackType !== attackType) return false

  const gap = lungeGap(attacker.x, defender.x, attackerIsPlayer)
  if (gap < 0 || gap > LUNGE_RANGE) return false

  return isVulnerable(defender.stance, attackType)
}

function createFencer(x: number): FencerState {
  return {
    x,
    stance: 'standing',
    attackType: null,
    touches: 0,
    lungeProgress: 0,
    lungeOriginX: x,
    lungeTargetX: x,
    lungeRecovering: false,
    attackResolved: false,
    jumpElapsedMs: 0,
    crouchHeld: false,
  }
}

export function createInitialState(): FencingState {
  return {
    status: 'idle',
    player: createFencer(PLAYER_START_X),
    bot: createFencer(BOT_START_X),
    phase: 'active',
    touchPauseMs: 0,
    lastScorer: null,
    touchFlashMs: 0,
    botState: 'advance',
    botReactionRemainingMs: 0,
    botPendingAction: null,
    matchOver: false,
    playerWon: false,
    finalScore: 0,
  }
}

function resetFencers(state: FencingState): FencingState {
  return {
    ...state,
    player: createFencer(PLAYER_START_X),
    bot: createFencer(BOT_START_X),
    botState: 'advance',
    botReactionRemainingMs: 0,
    botPendingAction: null,
    phase: 'active',
    touchPauseMs: 0,
    lastScorer: null,
  }
}

function isBusy(fencer: FencerState): boolean {
  return fencer.attackType !== null || fencer.jumpElapsedMs > 0
}

function canPlayerAct(state: FencingState): boolean {
  return state.status === 'playing' && state.phase === 'active' && !isBusy(state.player)
}

function clampPlayerX(x: number, botX: number): number {
  const maxX = botX - MIN_SEPARATION
  return Math.max(0, Math.min(maxX, x))
}

function clampBotX(x: number, playerX: number): number {
  const minX = playerX + MIN_SEPARATION
  return Math.min(ARENA_LANES - 1, Math.max(minX, x))
}

function tryMovePlayer(state: FencingState, direction: -1 | 1): FencingState {
  if (!canPlayerAct(state)) return state
  if (state.player.stance === 'crouching') return state

  const nextX = clampPlayerX(state.player.x + direction * STEP_SIZE, state.bot.x)
  if (nextX === state.player.x) return state

  return { ...state, player: { ...state.player, x: nextX } }
}

function tryJumpPlayer(state: FencingState): FencingState {
  if (!canPlayerAct(state)) return state
  if (state.player.stance === 'crouching') return state

  return {
    ...state,
    player: {
      ...state.player,
      stance: 'jumping',
      jumpElapsedMs: 1,
    },
  }
}

function tryCrouchStart(state: FencingState): FencingState {
  if (state.status !== 'playing' || state.phase !== 'active') return state
  if (isBusy(state.player) || state.player.stance === 'jumping') return state

  return {
    ...state,
    player: {
      ...state.player,
      crouchHeld: true,
      stance: 'crouching',
    },
  }
}

function tryCrouchEnd(state: FencingState): FencingState {
  if (state.player.stance !== 'crouching') {
    return { ...state, player: { ...state.player, crouchHeld: false } }
  }

  return {
    ...state,
    player: {
      ...state.player,
      crouchHeld: false,
      stance: 'standing',
    },
  }
}

function startLunge(
  state: FencingState,
  side: 'player' | 'bot',
  attackType: 'high' | 'low',
): FencingState {
  const fencer = side === 'player' ? state.player : state.bot
  if (fencer.attackType !== null) return state
  if (fencer.stance === 'jumping') return state
  if (attackType === 'low' && fencer.stance !== 'crouching') return state
  if (attackType === 'high' && fencer.stance === 'crouching') return state

  const direction = side === 'player' ? 1 : -1
  const otherX = side === 'player' ? state.bot.x : state.player.x
  const rawTarget = fencer.x + direction * LUNGE_DISTANCE
  const targetX =
    side === 'player'
      ? Math.min(rawTarget, otherX - MIN_SEPARATION)
      : Math.max(rawTarget, otherX + MIN_SEPARATION)

  const updated: FencerState = {
    ...fencer,
    attackType,
    lungeProgress: 0,
    lungeOriginX: fencer.x,
    lungeTargetX: targetX,
    lungeRecovering: false,
    attackResolved: false,
  }

  if (side === 'player') {
    return { ...state, player: updated }
  }
  return { ...state, bot: updated }
}

function tryLungePlayer(state: FencingState, attackType: 'high' | 'low'): FencingState {
  if (!canPlayerAct(state)) return state
  return startLunge(state, 'player', attackType)
}

function lungeX(fencer: FencerState): number {
  if (fencer.attackType === null) return fencer.x
  if (fencer.lungeRecovering) {
    const t = 1 - fencer.lungeProgress
    return fencer.lungeOriginX + (fencer.lungeTargetX - fencer.lungeOriginX) * t
  }
  const t = Math.min(fencer.lungeProgress / LUNGE_CONTACT_PROGRESS, 1)
  return fencer.lungeOriginX + (fencer.lungeTargetX - fencer.lungeOriginX) * t
}

function fencerWithLungeX(fencer: FencerState): FencerState {
  return { ...fencer, x: lungeX(fencer) }
}

function scoreTouch(
  state: FencingState,
  scorer: Scorer,
  player: FencerState,
  bot: FencerState,
): FencingState {
  if (!scorer) return state

  const updatedPlayer =
    scorer === 'player' ? { ...player, touches: player.touches + 1 } : player
  const updatedBot = scorer === 'bot' ? { ...bot, touches: bot.touches + 1 } : bot

  const playerTouches = updatedPlayer.touches
  const botTouches = updatedBot.touches
  const matchOver = playerTouches >= TOUCHES_TO_WIN || botTouches >= TOUCHES_TO_WIN
  const playerWon = playerTouches >= TOUCHES_TO_WIN

  if (matchOver) {
    const finalScore = calculateScore(playerTouches, botTouches)
    return {
      ...state,
      player: updatedPlayer,
      bot: updatedBot,
      matchOver: true,
      playerWon,
      finalScore,
      status: 'gameover',
      phase: 'touchPause',
      lastScorer: scorer,
      touchFlashMs: TOUCH_FLASH_MS,
    }
  }

  return {
    ...state,
    player: clearLunge(updatedPlayer),
    bot: clearLunge(updatedBot),
    phase: 'touchPause',
    touchPauseMs: TOUCH_PAUSE_MS,
    lastScorer: scorer,
    touchFlashMs: TOUCH_FLASH_MS,
    botState: 'reset',
    botReactionRemainingMs: 0,
    botPendingAction: null,
  }
}

function clearLunge(fencer: FencerState): FencerState {
  return {
    ...fencer,
    attackType: null,
    lungeProgress: 0,
    lungeRecovering: false,
    attackResolved: false,
    x: fencer.lungeRecovering ? fencer.lungeOriginX : fencer.x,
    lungeOriginX: fencer.lungeRecovering ? fencer.lungeOriginX : fencer.x,
    lungeTargetX: fencer.lungeRecovering ? fencer.lungeOriginX : fencer.x,
  }
}

function endLungeMiss(fencer: FencerState): FencerState {
  return {
    ...fencer,
    attackType: null,
    lungeProgress: 0,
    lungeRecovering: false,
    attackResolved: false,
    x: fencer.lungeOriginX,
    lungeTargetX: fencer.lungeOriginX,
    stance: fencer.crouchHeld ? 'crouching' : 'standing',
  }
}

function tickFencerLunge(
  fencer: FencerState,
  delta: number,
  defender: FencerState,
  attackerIsPlayer: boolean,
): { fencer: FencerState; scored: boolean; scorer: Scorer } {
  if (fencer.attackType === null) {
    return { fencer, scored: false, scorer: null }
  }

  const progressDelta = delta / LUNGE_DURATION_MS
  let next = { ...fencer }

  if (!fencer.lungeRecovering) {
    next.lungeProgress = fencer.lungeProgress + progressDelta

    if (!fencer.attackResolved && next.lungeProgress >= LUNGE_CONTACT_PROGRESS) {
      next.attackResolved = true
      const atContact = fencerWithLungeX({ ...next, lungeProgress: LUNGE_CONTACT_PROGRESS })
      if (resolveAttack(atContact, defender, fencer.attackType, attackerIsPlayer)) {
        return {
          fencer: { ...atContact, x: lungeX(atContact) },
          scored: true,
          scorer: attackerIsPlayer ? 'player' : 'bot',
        }
      }
      next.lungeRecovering = true
      next.lungeProgress = 0
    }

    if (!next.lungeRecovering && next.lungeProgress >= 1) {
      next.lungeRecovering = true
      next.lungeProgress = 0
    }
  }

  if (next.lungeRecovering) {
    next.lungeProgress = fencer.lungeProgress + progressDelta
    next.x = lungeX(next)
    if (next.lungeProgress >= 1) {
      return { fencer: endLungeMiss(next), scored: false, scorer: null }
    }
    return { fencer: { ...next, x: lungeX(next) }, scored: false, scorer: null }
  }

  return { fencer: { ...next, x: lungeX(next) }, scored: false, scorer: null }
}

function tickFencerJump(fencer: FencerState, delta: number): FencerState {
  if (fencer.jumpElapsedMs <= 0) return fencer

  const elapsed = fencer.jumpElapsedMs + delta
  if (elapsed >= JUMP_DURATION_MS) {
    return {
      ...fencer,
      jumpElapsedMs: 0,
      stance: fencer.crouchHeld ? 'crouching' : 'standing',
    }
  }

  return { ...fencer, jumpElapsedMs: elapsed, stance: 'jumping' }
}

function tickTouchPause(state: FencingState, delta: number): FencingState {
  const touchFlashMs = Math.max(0, state.touchFlashMs - delta)
  const touchPauseMs = Math.max(0, state.touchPauseMs - delta)

  if (touchPauseMs > 0) {
    return { ...state, touchPauseMs, touchFlashMs }
  }

  if (state.matchOver) {
    return { ...state, touchFlashMs: 0 }
  }

  return { ...resetFencers({ ...state, touchFlashMs: 0, touchPauseMs: 0 }) }
}

function distanceBetween(player: FencerState, bot: FencerState): number {
  return bot.x - player.x
}

function botInAttackRange(player: FencerState, bot: FencerState): boolean {
  const gap = distanceBetween(player, bot)
  return gap <= ATTACK_RANGE && gap >= MIN_SEPARATION
}

function scheduleBotAction(
  state: FencingState,
  action: BotPendingAction,
  random: RandomFn,
): FencingState {
  const delay =
    BOT_REACTION_MIN_MS + random() * (BOT_REACTION_MAX_MS - BOT_REACTION_MIN_MS)
  return {
    ...state,
    botPendingAction: action,
    botReactionRemainingMs: delay,
  }
}

function pickEvadeAction(
  playerAttack: AttackType,
  random: RandomFn,
): BotPendingAction {
  const roll = random()
  if (playerAttack === 'high') {
    if (roll < 0.6) return { kind: 'crouch' }
    if (roll < 0.8) return { kind: 'stepBack' }
    return { kind: 'jump' }
  }
  if (playerAttack === 'low') {
    if (roll < 0.6) return { kind: 'jump' }
    if (roll < 0.8) return { kind: 'stepBack' }
    return { kind: 'crouch' }
  }
  const options: BotPendingAction[] = [
    { kind: 'jump' },
    { kind: 'crouch' },
    { kind: 'stepBack' },
  ]
  return options[Math.floor(random() * options.length)]
}

function pickAttackType(playerStance: Stance): 'high' | 'low' {
  return playerStance === 'crouching' ? 'low' : 'high'
}

function executeBotAction(state: FencingState, action: BotPendingAction): FencingState {
  if (isBusy(state.bot)) return state

  switch (action.kind) {
    case 'move': {
      const nextX = clampBotX(state.bot.x - STEP_SIZE, state.player.x)
      if (nextX === state.bot.x) return state
      return { ...state, bot: { ...state.bot, x: nextX } }
    }
    case 'stepBack': {
      const nextX = clampBotX(state.bot.x + STEP_SIZE, state.player.x)
      if (nextX === state.bot.x) return state
      return { ...state, bot: { ...state.bot, x: nextX } }
    }
    case 'jump':
      if (state.bot.stance === 'crouching') return state
      return {
        ...state,
        bot: { ...state.bot, stance: 'jumping', jumpElapsedMs: 1 },
      }
    case 'crouch':
      return {
        ...state,
        bot: { ...state.bot, crouchHeld: true, stance: 'crouching' },
      }
    case 'lungeHigh':
      return startLunge(state, 'bot', 'high')
    case 'lungeLow':
      return startLunge(state, 'bot', 'low')
    default:
      return state
  }
}

function tickBotAi(state: FencingState, delta: number, random: RandomFn): FencingState {
  if (state.phase !== 'active') return state

  let next = { ...state }

  if (state.player.attackType !== null && state.botState !== 'evade') {
    next = {
      ...scheduleBotAction(next, pickEvadeAction(state.player.attackType, random), random),
      botState: 'evade',
    }
  }

  if (next.botReactionRemainingMs > 0) {
    next.botReactionRemainingMs = Math.max(0, next.botReactionRemainingMs - delta)
    if (next.botReactionRemainingMs === 0 && next.botPendingAction) {
      next = executeBotAction(next, next.botPendingAction)
      next.botPendingAction = null
      if (next.botState === 'evade' && state.player.attackType === null) {
        next.botState = 'advance'
      }
      if (next.botState === 'attack') {
        next.botState = 'advance'
      }
    }
    return next
  }

  if (isBusy(next.bot)) return next

  if (next.botState === 'reset') {
    return { ...next, botState: 'advance' }
  }

  if (next.botState === 'evade') {
    if (state.player.attackType === null) {
      return { ...next, botState: 'advance' }
    }
    return next
  }

  if (botInAttackRange(next.player, next.bot)) {
  if (!next.botPendingAction) {
      return scheduleBotAction(
        { ...next, botState: 'attack' },
        {
          kind:
            pickAttackType(next.player.stance) === 'high'
              ? 'lungeHigh'
              : 'lungeLow',
        },
        random,
      )
    }
    return next
  }

  if (!next.botPendingAction) {
    return scheduleBotAction(next, { kind: 'move' }, random)
  }

  return next
}

function tickAnimations(state: FencingState, delta: number): FencingState {
  let player = tickFencerJump(state.player, delta)
  let bot = tickFencerJump(state.bot, delta)

  const playerLunge = tickFencerLunge(player, delta, bot, true)
  player = playerLunge.fencer
  if (playerLunge.scored) {
    return scoreTouch(state, playerLunge.scorer, player, bot)
  }

  const botLunge = tickFencerLunge(bot, delta, player, false)
  bot = botLunge.fencer
  if (botLunge.scored) {
    return scoreTouch(state, botLunge.scorer, player, bot)
  }

  return { ...state, player, bot }
}

export function fencingReducer(
  state: FencingState,
  action: FencingAction,
  random: RandomFn = Math.random,
): FencingState {
  switch (action.type) {
    case 'start':
    case 'restart':
      return { ...createInitialState(), status: 'playing' }
    case 'moveLeft':
      return tryMovePlayer(state, -1)
    case 'moveRight':
      return tryMovePlayer(state, 1)
    case 'jump':
      return tryJumpPlayer(state)
    case 'crouchStart':
      return tryCrouchStart(state)
    case 'crouchEnd':
      return tryCrouchEnd(state)
    case 'lungeHigh':
      return tryLungePlayer(state, 'high')
    case 'lungeLow':
      return tryLungePlayer(state, 'low')
    case 'tick': {
      if (state.status !== 'playing') return state

      if (state.phase === 'touchPause') {
        return tickTouchPause(state, action.delta)
      }

      let next = tickAnimations(state, action.delta)
      next = tickBotAi(next, action.delta, random)
      return next
    }
    default:
      return state
  }
}

export function toSnapshot(state: FencingState): FencingSnapshot {
  const finalScore =
    state.status === 'gameover'
      ? state.finalScore
      : calculateScore(state.player.touches, state.bot.touches)

  return {
    status: state.status,
    player: state.player,
    bot: state.bot,
    phase: state.phase,
    lastScorer: state.lastScorer,
    touchFlashMs: state.touchFlashMs,
    playerTouches: state.player.touches,
    botTouches: state.bot.touches,
    matchOver: state.matchOver,
    playerWon: state.playerWon,
    finalScore,
    tadpoles: scoreToTadpoles(Math.max(0, finalScore)),
  }
}

export function createFencerForTest(overrides: Partial<FencerState> = {}): FencerState {
  return { ...createFencer(PLAYER_START_X), ...overrides }
}

export function pickEvadeActionForTest(
  playerAttack: AttackType,
  random: RandomFn,
): BotPendingAction {
  return pickEvadeAction(playerAttack, random)
}
