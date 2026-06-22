import { describe, expect, it } from 'vitest'
import {
  TOUCHES_TO_WIN,
} from './constants'
import {
  calculateScore,
  createFencerForTest,
  createInitialState,
  fencingReducer,
  pickEvadeActionForTest,
  resolveAttack,
  resolveRightArrowInput,
  scoreToTadpoles,
} from './gameLogic'

describe('calculateScore', () => {
  it('awards net touches times 3 plus flawless bonus', () => {
    expect(calculateScore(5, 0)).toBe(30)
    expect(calculateScore(5, 2)).toBe(9)
    expect(calculateScore(3, 5)).toBe(-6)
    expect(calculateScore(5, 4)).toBe(3)
  })

  it('only awards flawless bonus on 5-0', () => {
    expect(calculateScore(5, 1)).toBe(12)
    expect(calculateScore(4, 0)).toBe(12)
  })
})

describe('scoreToTadpoles', () => {
  it('returns score divided by 4 with no rounding', () => {
    expect(scoreToTadpoles(30)).toBe(7.5)
    expect(scoreToTadpoles(9)).toBe(2.25)
    expect(scoreToTadpoles(0)).toBe(0)
    expect(scoreToTadpoles(-6)).toBe(-1.5)
  })
})

describe('resolveRightArrowInput', () => {
  it('registers lunge when second tap is within window', () => {
    const first = resolveRightArrowInput(1000, null)
    expect(first.intent).toBe('move')
    expect(first.lastRightTap).toBe(1000)

    const second = resolveRightArrowInput(1200, first.lastRightTap)
    expect(second.intent).toBe('lunge')
    expect(second.lastRightTap).toBeNull()
  })

  it('treats taps separated by more than window as moves', () => {
    const first = resolveRightArrowInput(1000, null)
    const second = resolveRightArrowInput(1400, first.lastRightTap)
    expect(second.intent).toBe('move')
    expect(second.lastRightTap).toBe(1400)
  })

  it('treats tap exactly at window boundary as lunge', () => {
    const first = resolveRightArrowInput(1000, null)
    const second = resolveRightArrowInput(1300, first.lastRightTap)
    expect(second.intent).toBe('lunge')
  })
})

describe('resolveAttack', () => {
  const baseAttacker = createFencerForTest({
    x: 10,
    attackType: 'high',
    stance: 'standing',
  })

  it('scores high lunge against standing defender in range', () => {
    const defender = createFencerForTest({ x: 11, stance: 'standing' })
    expect(resolveAttack(baseAttacker, defender, 'high', true)).toBe(true)
  })

  it('never scores high lunge against crouching defender', () => {
    const defender = createFencerForTest({ x: 11, stance: 'crouching' })
    expect(resolveAttack(baseAttacker, defender, 'high', true)).toBe(false)
  })

  it('never scores low lunge against standing defender', () => {
    const attacker = createFencerForTest({
      x: 10,
      attackType: 'low',
      stance: 'crouching',
    })
    const defender = createFencerForTest({ x: 11, stance: 'standing' })
    expect(resolveAttack(attacker, defender, 'low', true)).toBe(false)
  })

  it('never scores low lunge against jumping defender', () => {
    const attacker = createFencerForTest({
      x: 10,
      attackType: 'low',
      stance: 'crouching',
    })
    const defender = createFencerForTest({ x: 11, stance: 'jumping' })
    expect(resolveAttack(attacker, defender, 'low', true)).toBe(false)
  })

  it('scores low lunge against crouching defender', () => {
    const attacker = createFencerForTest({
      x: 10,
      attackType: 'low',
      stance: 'crouching',
    })
    const defender = createFencerForTest({ x: 11, stance: 'crouching' })
    expect(resolveAttack(attacker, defender, 'low', true)).toBe(true)
  })

  it('scores high lunge against jumping defender', () => {
    const defender = createFencerForTest({ x: 11, stance: 'jumping' })
    expect(resolveAttack(baseAttacker, defender, 'high', true)).toBe(true)
  })

  it('rejects jump-lunge from attacker', () => {
    const attacker = createFencerForTest({
      x: 10,
      attackType: 'high',
      stance: 'jumping',
    })
    const defender = createFencerForTest({ x: 11, stance: 'standing' })
    expect(resolveAttack(attacker, defender, 'high', true)).toBe(false)
  })

  it('rejects attacks out of lunge range', () => {
    const defender = createFencerForTest({ x: 13, stance: 'standing' })
    expect(resolveAttack(baseAttacker, defender, 'high', true)).toBe(false)
  })

  it('works for bot attacking player', () => {
    const attacker = createFencerForTest({
      x: 11,
      attackType: 'high',
      stance: 'standing',
    })
    const defender = createFencerForTest({ x: 10, stance: 'standing' })
    expect(resolveAttack(attacker, defender, 'high', false)).toBe(true)
  })
})

describe('fencingReducer movement', () => {
  it('blocks movement at minimum separation', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = {
      ...state,
      player: { ...state.player, x: 4 },
      bot: { ...state.bot, x: 6 },
    }

    state = fencingReducer(state, { type: 'moveRight' })
    expect(state.player.x).toBe(4)
  })

  it('allows discrete step movement when separated', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = fencingReducer(state, { type: 'moveRight' })
    expect(state.player.x).toBe(5)
  })

  it('blocks horizontal movement while crouching', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = fencingReducer(state, { type: 'crouchStart' })
    state = fencingReducer(state, { type: 'moveRight' })
    expect(state.player.x).toBe(4)
  })
})

describe('fencingReducer lunge', () => {
  it('rejects low lunge when not crouching', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = fencingReducer(state, { type: 'lungeLow' })
    expect(state.player.attackType).toBeNull()
  })

  it('starts high lunge from standing', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = fencingReducer(state, { type: 'lungeHigh' })
    expect(state.player.attackType).toBe('high')
  })

  it('starts low lunge only from crouch', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = fencingReducer(state, { type: 'crouchStart' })
    state = fencingReducer(state, { type: 'lungeLow' })
    expect(state.player.attackType).toBe('low')
  })
})

describe('match end', () => {
  it('ends exactly when player reaches 5 touches', () => {
    let state = { ...createInitialState(), status: 'playing' as const }
    state = {
      ...state,
      bot: { ...state.bot, x: 9, stance: 'standing', touches: 2 },
      player: {
        ...state.player,
        touches: TOUCHES_TO_WIN - 1,
        x: 6,
        stance: 'standing',
        attackType: 'high',
        lungeOriginX: 6,
        lungeTargetX: 9,
        lungeProgress: 0,
      },
    }

    state = fencingReducer(state, { type: 'tick', delta: 200 })
    expect(state.player.touches).toBe(TOUCHES_TO_WIN)
    expect(state.status).toBe('gameover')
    expect(state.matchOver).toBe(true)
    expect(state.playerWon).toBe(true)
    expect(state.finalScore).toBe(calculateScore(TOUCHES_TO_WIN, 2))
  })
})

describe('pickEvadeActionForTest', () => {
  it('biases toward correct evade for high attacks', () => {
    let crouchCount = 0
    for (let i = 0; i < 100; i++) {
      const action = pickEvadeActionForTest('high', () => i / 100)
      if (action.kind === 'crouch') crouchCount++
    }
    expect(crouchCount).toBeGreaterThan(50)
  })

  it('biases toward correct evade for low attacks', () => {
    let jumpCount = 0
    for (let i = 0; i < 100; i++) {
      const action = pickEvadeActionForTest('low', () => i / 100)
      if (action.kind === 'jump') jumpCount++
    }
    expect(jumpCount).toBeGreaterThan(50)
  })
})
