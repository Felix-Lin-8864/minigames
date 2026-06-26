import { normalizeTadpoles } from './tadpoleAmount'

function adjustFrogtuneAmount(
  amounts: Record<string, number>,
  gameId: string,
  delta: number,
): Record<string, number> {
  const change = normalizeTadpoles(delta)
  if (change === 0) return amounts

  return {
    ...amounts,
    [gameId]: normalizeTadpoles((amounts[gameId] ?? 0) + change),
  }
}

export function adjustFrogtuneNet(
  frogtuneNet: Record<string, number>,
  gameId: string,
  delta: number,
): Record<string, number> {
  return adjustFrogtuneAmount(frogtuneNet, gameId, delta)
}

export function adjustFrogtuneWinnings(
  frogtuneWinnings: Record<string, number>,
  gameId: string,
  amount: number,
): Record<string, number> {
  return adjustFrogtuneAmount(frogtuneWinnings, gameId, amount)
}

export function adjustFrogtuneLosses(
  frogtuneLosses: Record<string, number>,
  gameId: string,
  amount: number,
): Record<string, number> {
  return adjustFrogtuneAmount(frogtuneLosses, gameId, amount)
}

export function backfillFrogtuneWinningsLosses(
  frogtuneNet: Record<string, number>,
  frogtuneWinnings: Record<string, number>,
  frogtuneLosses: Record<string, number>,
): { frogtuneWinnings: Record<string, number>; frogtuneLosses: Record<string, number> } {
  const winnings = { ...frogtuneWinnings }
  const losses = { ...frogtuneLosses }

  for (const [gameId, net] of Object.entries(frogtuneNet)) {
    if (gameId in winnings || gameId in losses) continue
    if (net > 0) winnings[gameId] = net
    else if (net < 0) losses[gameId] = -net
  }

  return { frogtuneWinnings: winnings, frogtuneLosses: losses }
}
