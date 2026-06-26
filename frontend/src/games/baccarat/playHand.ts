import { dealCard } from '../cards/shoe'
import type { Card } from '../cards/types'
import type { ShoeState } from '../cards/shoe'
import {
  handTotal,
  isNatural,
  resolveHand,
  shouldBankerDraw,
  shouldPlayerDraw,
  baccaratCardValue,
} from './handLogic'
import type { BaccaratOutcome } from './types'

export interface PlayHandResult {
  playerCards: Card[]
  bankerCards: Card[]
  playerTotal: number
  bankerTotal: number
  outcome: BaccaratOutcome
  shoe: ShoeState
}

export function playHand(shoe: ShoeState): PlayHandResult {
  const playerCards: Card[] = []
  const bankerCards: Card[] = []

  playerCards.push(dealCard(shoe))
  bankerCards.push(dealCard(shoe))
  playerCards.push(dealCard(shoe))
  bankerCards.push(dealCard(shoe))

  let playerTotal = handTotal(playerCards)
  let bankerTotal = handTotal(bankerCards)

  if (isNatural(playerTotal) || isNatural(bankerTotal)) {
    const outcome = resolveHand(playerCards, bankerCards)
    return { playerCards, bankerCards, playerTotal, bankerTotal, outcome, shoe }
  }

  let playerDrewThird = false
  let playerThirdCardValue: number | null = null

  if (shouldPlayerDraw(playerTotal)) {
    const thirdCard = dealCard(shoe)
    playerCards.push(thirdCard)
    playerThirdCardValue = baccaratCardValue(thirdCard.rank)
    playerDrewThird = true
    playerTotal = handTotal(playerCards)
  }

  if (
    shouldBankerDraw(bankerTotal, playerDrewThird, playerThirdCardValue)
  ) {
    bankerCards.push(dealCard(shoe))
    bankerTotal = handTotal(bankerCards)
  }

  const outcome = resolveHand(playerCards, bankerCards)
  return { playerCards, bankerCards, playerTotal, bankerTotal, outcome, shoe }
}
