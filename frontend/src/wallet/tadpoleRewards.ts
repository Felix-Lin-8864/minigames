import type { AnagramsMode } from '../games/anagrams/types'

export const TADPOLE_EARNING_GAMES = [
  'snake',
  'frogger',
  'anagrams',
  'stacker',
  'froggle',
  'chain-pond',
] as const

export type TadpoleEarningGameId = (typeof TADPOLE_EARNING_GAMES)[number]

export interface AnagramsTadpoleRewardContext {
  duration: number
  mode: AnagramsMode
}

export type TadpoleRewardContext = AnagramsTadpoleRewardContext

export function isTadpoleEarningGame(gameId: string): gameId is TadpoleEarningGameId {
  return (TADPOLE_EARNING_GAMES as readonly string[]).includes(gameId)
}

export function tadpolesEarnedForGame(
  gameId: TadpoleEarningGameId,
  score: number,
  context?: TadpoleRewardContext,
): number {
  const safeScore = Math.max(0, score)

  switch (gameId) {
    case 'snake':
    case 'frogger':
      return safeScore / 2
    case 'stacker':
      return safeScore / 4
    case 'froggle':
    case 'chain-pond':
      return safeScore
    case 'anagrams': {
      const duration = context?.duration ?? 60
      const units = Math.ceil(safeScore / (duration * 10))
      return context?.mode === 'reps' ? units : units * 2
    }
  }
}
