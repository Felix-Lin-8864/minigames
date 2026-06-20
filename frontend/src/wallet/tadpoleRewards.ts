export const TADPOLE_EARNING_GAMES = ['snake', 'frogger', 'anagrams'] as const

export type TadpoleEarningGameId = (typeof TADPOLE_EARNING_GAMES)[number]

export function isTadpoleEarningGame(gameId: string): gameId is TadpoleEarningGameId {
  return (TADPOLE_EARNING_GAMES as readonly string[]).includes(gameId)
}

export function tadpolesEarnedForGame(gameId: TadpoleEarningGameId, score: number): number {
  const safeScore = Math.max(0, score)

  switch (gameId) {
    case 'snake':
    case 'frogger':
      return Math.floor(safeScore)
    case 'anagrams':
      return Math.ceil(safeScore / 400)
  }
}
