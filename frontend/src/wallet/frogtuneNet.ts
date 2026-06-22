import { normalizeTadpoles } from './tadpoleAmount'

export function adjustFrogtuneNet(
  frogtuneNet: Record<string, number>,
  gameId: string,
  delta: number,
): Record<string, number> {
  const change = normalizeTadpoles(delta)
  if (change === 0) return frogtuneNet

  return {
    ...frogtuneNet,
    [gameId]: normalizeTadpoles((frogtuneNet[gameId] ?? 0) + change),
  }
}
