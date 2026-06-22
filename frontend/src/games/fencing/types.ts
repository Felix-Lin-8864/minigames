export type GameStatus = 'idle' | 'playing' | 'gameover'

export type Stance = 'standing' | 'crouching' | 'jumping'
export type AttackType = 'high' | 'low' | null
export type BotState = 'advance' | 'attack' | 'evade' | 'reset'
export type ExchangePhase = 'active' | 'touchPause'
export type Scorer = 'player' | 'bot' | null

export type BotPendingAction =
  | { kind: 'move' }
  | { kind: 'jump' }
  | { kind: 'crouch' }
  | { kind: 'lungeHigh' }
  | { kind: 'lungeLow' }
  | { kind: 'stepBack' }

export interface FencerState {
  x: number
  stance: Stance
  attackType: AttackType
  touches: number
  lungeProgress: number
  lungeOriginX: number
  lungeTargetX: number
  lungeRecovering: boolean
  attackResolved: boolean
  jumpElapsedMs: number
  crouchHeld: boolean
}

export interface FencingState {
  status: GameStatus
  player: FencerState
  bot: FencerState
  phase: ExchangePhase
  touchPauseMs: number
  lastScorer: Scorer
  touchFlashMs: number
  botState: BotState
  botReactionRemainingMs: number
  botPendingAction: BotPendingAction | null
  matchOver: boolean
  playerWon: boolean
  finalScore: number
}

export type FencingAction =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'tick'; delta: number }
  | { type: 'moveLeft' }
  | { type: 'moveRight' }
  | { type: 'jump' }
  | { type: 'crouchStart' }
  | { type: 'crouchEnd' }
  | { type: 'lungeHigh' }
  | { type: 'lungeLow' }

export interface FencingSnapshot {
  status: GameStatus
  player: FencerState
  bot: FencerState
  phase: ExchangePhase
  lastScorer: Scorer
  touchFlashMs: number
  playerTouches: number
  botTouches: number
  matchOver: boolean
  playerWon: boolean
  finalScore: number
  tadpoles: number
}
