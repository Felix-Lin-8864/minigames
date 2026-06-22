import {
  DOUBLE_AFTER_SPLIT,
  MAX_SPLITS,
  MIN_BET,
  MIN_PAIR_BET,
  SPLIT_ACES_ONE_CARD,
} from './constants'
import { cloneRemainingBySuitRank } from './cards'
import {
  allPlayerHandsDone,
  blackjackPayout,
  dealerShouldHit,
  pushPayout,
  winPayout,
} from './hand'
import { getHandValue, isBlackjack, isBusted, isPair } from './handValue'
import { evaluatePairBet, getPairPayout } from './pairBet'
import { formatTadpolesFixed } from '../../wallet/tadpoleAmount'
import {
  completeHand,
  createShoe,
  dealCard,
  revealCard,
  shoeSnapshot,
  syncRunningCount,
} from './shoe'
import type {
  PlayerHand,
  ShoeState,
  TwentyOneAction,
  TwentyOneSnapshot,
  TwentyOneState,
} from './types'

function createEmptyHand(bet: number): PlayerHand {
  return {
    cards: [],
    bet,
    status: 'active',
    isSplitAces: false,
    isFromSplit: false,
    outcome: 'pending',
    payout: 0,
  }
}

export function createInitialState(shoe?: ShoeState): TwentyOneState {
  return {
    phase: 'betting',
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    dealerHoleRevealed: false,
    pendingBet: MIN_BET,
    pendingPairBet: 0,
    pairBetWager: 0,
    pairBetResult: null,
    pairBetPayout: 0,
    pairBetOriginalCards: null,
    message: null,
    lastHandNet: 0,
    shoe: shoe ?? createShoe(),
    splitCount: 0,
    resolutionId: 0,
  }
}

function resolveHand(state: TwentyOneState, resolved: Omit<TwentyOneState, 'phase' | 'resolutionId'>): TwentyOneState {
  return {
    ...resolved,
    phase: 'resolved',
    resolutionId: state.resolutionId + 1,
  }
}

function cloneShoe(shoe: ShoeState): ShoeState {
  const clone: ShoeState = {
    queue: [...shoe.queue],
    discardPile: [...shoe.discardPile],
    handsCompleted: shoe.handsCompleted,
    remainingBySuitRank: cloneRemainingBySuitRank(shoe.remainingBySuitRank),
    remainingByValue: { ...shoe.remainingByValue },
    runningCount: 0,
  }
  syncRunningCount(clone)
  return clone
}

function activeHand(state: TwentyOneState): PlayerHand | undefined {
  return state.playerHands[state.activeHandIndex]
}

export function totalStakedAmount(state: TwentyOneState): number {
  if (state.playerHands.length > 0) {
    return state.playerHands.reduce((sum, hand) => sum + hand.bet, 0) + state.pairBetWager
  }
  return state.pendingBet + state.pendingPairBet
}

function canDoubleHand(hand: PlayerHand): boolean {
  if (hand.status !== 'active' || hand.cards.length !== 2 || hand.isSplitAces) return false
  if (hand.isFromSplit && !DOUBLE_AFTER_SPLIT) return false
  return true
}

function canSplitHand(state: TwentyOneState, hand: PlayerHand): boolean {
  if (hand.status !== 'active' || hand.cards.length !== 2 || !isPair(hand.cards)) {
    return false
  }
  if (state.splitCount >= MAX_SPLITS) return false
  if (hand.isFromSplit && hand.cards[0]?.rank === 'A' && SPLIT_ACES_ONE_CARD) return false
  return true
}

function advanceActiveHand(state: TwentyOneState): TwentyOneState {
  const nextIndex = state.playerHands.findIndex(
    (hand, index) => index > state.activeHandIndex && hand.status === 'active',
  )
  if (nextIndex === -1) {
    return { ...state, phase: 'dealer' }
  }
  return { ...state, activeHandIndex: nextIndex }
}

function handNetMessage(net: number): string {
  if (net > 0) return `You won ${formatTadpolesFixed(net, 2)} tadpoles!`
  if (net < 0) return `You lost ${formatTadpolesFixed(Math.abs(net), 2)} tadpoles.`
  return 'Push.'
}

function checkImmediateBlackjacks(state: TwentyOneState): TwentyOneState {
  const playerHand = state.playerHands[0]!
  const playerBJ = isBlackjack(playerHand.cards)
  const dealerBJ = isBlackjack(state.dealerHand)

  if (!playerBJ && !dealerBJ) return state

  const shoe = cloneShoe(state.shoe)
  const revealedDealer = state.dealerHand.map((card) =>
    card.faceUp ? card : revealCard(shoe, card),
  )

  let message: string | null = null
  let net = 0
  const hands = [...state.playerHands]

  if (playerBJ && dealerBJ) {
    hands[0] = {
      ...playerHand,
      status: 'stood',
      outcome: 'push',
      payout: pushPayout(playerHand.bet),
    }
    message = 'Push — both have blackjack.'
    net = 0
  } else if (playerBJ) {
    const payout = blackjackPayout(playerHand.bet)
    net = payout - playerHand.bet
    hands[0] = {
      ...playerHand,
      status: 'blackjack',
      outcome: 'blackjack',
      payout,
    }
    message = handNetMessage(net)
  } else {
    net = -playerHand.bet
    hands[0] = {
      ...playerHand,
      status: 'stood',
      outcome: 'lose',
      payout: 0,
    }
    message = `Dealer has blackjack. ${handNetMessage(net)}`
  }

  const { shoe: nextShoe } = completeHand(shoe)

  return resolveHand(state, {
    ...state,
    shoe: nextShoe,
    dealerHand: revealedDealer,
    dealerHoleRevealed: true,
    playerHands: hands,
    message,
    lastHandNet: net,
  })
}

function finishDealAfterPairReveal(state: TwentyOneState): TwentyOneState {
  return checkImmediateBlackjacks(state)
}

function dealInitialHand(state: TwentyOneState, pairBet: number): TwentyOneState {
  const bet = state.pendingBet
  const shoe = cloneShoe(state.shoe)

  const playerCards = [dealCard(shoe), dealCard(shoe)]
  const dealerUp = dealCard(shoe)
  const dealerHole = dealCard(shoe, false)

  const playerHand: PlayerHand = {
    ...createEmptyHand(bet),
    cards: playerCards,
    status: isBlackjack(playerCards) ? 'blackjack' : 'active',
  }

  const pairBetResult = pairBet > 0 ? evaluatePairBet(playerCards[0]!, playerCards[1]!) : null
  const pairBetPayout =
    pairBet > 0 && pairBetResult ? getPairPayout(pairBetResult, pairBet) : 0

  const base: TwentyOneState = {
    ...state,
    shoe,
    playerHands: [playerHand],
    activeHandIndex: 0,
    dealerHand: [dealerUp, dealerHole],
    dealerHoleRevealed: false,
    message: null,
    lastHandNet: 0,
    splitCount: 0,
    pairBetWager: pairBet,
    pairBetResult,
    pairBetPayout,
    pairBetOriginalCards: pairBet > 0 ? [...playerCards] : null,
  }

  if (pairBet > 0) {
    return { ...base, phase: 'pair_reveal' }
  }

  return finishDealAfterPairReveal({ ...base, phase: 'playing' })
}

function continueAfterPairReveal(state: TwentyOneState): TwentyOneState {
  if (state.phase !== 'pair_reveal') return state
  return finishDealAfterPairReveal({ ...state, phase: 'playing' })
}

function hitHand(state: TwentyOneState): TwentyOneState {
  const hand = activeHand(state)
  if (!hand || hand.status !== 'active') return state

  const shoe = cloneShoe(state.shoe)
  const card = dealCard(shoe)
  const cards = [...hand.cards, card]
  const hands = [...state.playerHands]

  if (isBusted(cards)) {
    hands[state.activeHandIndex] = {
      ...hand,
      cards,
      status: 'busted',
      outcome: 'bust',
      payout: 0,
    }
    const advanced = advanceActiveHand({ ...state, shoe, playerHands: hands })
    return advanced.phase === 'dealer'
      ? startDealerTurn({ ...advanced, shoe })
      : { ...advanced, shoe }
  }

  if (hand.isSplitAces && SPLIT_ACES_ONE_CARD) {
    hands[state.activeHandIndex] = { ...hand, cards, status: 'stood' }
    const advanced = advanceActiveHand({ ...state, shoe, playerHands: hands })
    return advanced.phase === 'dealer'
      ? startDealerTurn({ ...advanced, shoe })
      : { ...advanced, shoe }
  }

  hands[state.activeHandIndex] = { ...hand, cards, status: hand.status }
  return { ...state, shoe, playerHands: hands }
}

function standHand(state: TwentyOneState): TwentyOneState {
  const hand = activeHand(state)
  if (!hand || hand.status !== 'active') return state

  const hands = [...state.playerHands]
  hands[state.activeHandIndex] = { ...hand, status: 'stood' }
  const advanced = advanceActiveHand({ ...state, playerHands: hands })
  return advanced.phase === 'dealer' ? startDealerTurn(advanced) : advanced
}

function doubleHand(state: TwentyOneState, additionalBet: number): TwentyOneState {
  const hand = activeHand(state)
  if (!hand || !canDoubleHand(hand) || additionalBet !== hand.bet) return state

  const shoe = cloneShoe(state.shoe)
  const card = dealCard(shoe)
  const cards = [...hand.cards, card]
  const hands = [...state.playerHands]
  const bet = hand.bet + additionalBet

  if (isBusted(cards)) {
    hands[state.activeHandIndex] = {
      ...hand,
      cards,
      bet,
      status: 'doubled',
      outcome: 'bust',
      payout: 0,
    }
  } else {
    hands[state.activeHandIndex] = {
      ...hand,
      cards,
      bet,
      status: 'doubled',
    }
  }

  const advanced = advanceActiveHand({ ...state, shoe, playerHands: hands })
  return advanced.phase === 'dealer'
    ? startDealerTurn({ ...advanced, shoe })
    : { ...advanced, shoe }
}

function splitHand(state: TwentyOneState, additionalBet: number): TwentyOneState {
  const hand = activeHand(state)
  if (!hand || !canSplitHand(state, hand) || additionalBet !== hand.bet) return state

  const shoe = cloneShoe(state.shoe)
  const [cardA, cardB] = hand.cards
  const isAces = cardA!.rank === 'A'

  const handOne: PlayerHand = {
    ...createEmptyHand(hand.bet),
    cards: [cardA!, dealCard(shoe)],
    isFromSplit: true,
    isSplitAces: isAces,
    status: isAces && SPLIT_ACES_ONE_CARD ? 'stood' : 'active',
  }

  const handTwo: PlayerHand = {
    ...createEmptyHand(hand.bet),
    cards: [cardB!, dealCard(shoe)],
    isFromSplit: true,
    isSplitAces: isAces,
    status: isAces && SPLIT_ACES_ONE_CARD ? 'stood' : 'active',
  }

  const hands = [...state.playerHands]
  hands.splice(state.activeHandIndex, 1, handOne, handTwo)

  let next: TwentyOneState = {
    ...state,
    shoe,
    playerHands: hands,
    splitCount: state.splitCount + 1,
  }

  if (allPlayerHandsDone(hands)) {
    next = startDealerTurn(next)
  }

  return next
}

export function startDealerTurn(state: TwentyOneState): TwentyOneState {
  const shoe = cloneShoe(state.shoe)
  let dealerHand = state.dealerHand.map((card) =>
    card.faceUp ? card : revealCard(shoe, card),
  )

  while (dealerShouldHit(dealerHand)) {
    dealerHand = [...dealerHand, dealCard(shoe)]
  }

  const dealerTotal = getHandValue(dealerHand).total
  const dealerBusted = dealerTotal > 21

  let totalBet = 0

  const playerHands = state.playerHands.map((hand) => {
    totalBet += hand.bet
    if (hand.outcome === 'bust') {
      return hand
    }

    const playerTotal = getHandValue(hand.cards).total
    let outcome = hand.outcome
    let payout = hand.payout

    if (dealerBusted) {
      outcome = 'win'
      payout = winPayout(hand.bet)
    } else if (playerTotal > dealerTotal) {
      outcome = 'win'
      payout = winPayout(hand.bet)
    } else if (playerTotal < dealerTotal) {
      outcome = 'lose'
      payout = 0
    } else {
      outcome = 'push'
      payout = pushPayout(hand.bet)
    }

    return { ...hand, outcome, payout }
  })

  const { shoe: nextShoe } = completeHand(shoe)
  const totalWon = playerHands.reduce((sum, h) => sum + h.payout, 0)
  const net = totalWon - totalBet

  return resolveHand(state, {
    ...state,
    shoe: nextShoe,
    dealerHand,
    dealerHoleRevealed: true,
    playerHands,
    lastHandNet: net,
    message: handNetMessage(net),
  })
}

export function twentyOneReducer(state: TwentyOneState, action: TwentyOneAction): TwentyOneState {
  switch (action.type) {
    case 'set_bet':
      return {
        ...state,
        pendingBet: Math.max(MIN_BET, Math.floor(action.bet)),
      }

    case 'set_pair_bet':
      return {
        ...state,
        pendingPairBet: Math.max(0, Math.floor(action.pairBet)),
      }

    case 'deal': {
      if (state.phase !== 'betting' && state.phase !== 'resolved') return state
      const bet = Math.max(MIN_BET, Math.floor(action.bet))
      const pairBet = Math.floor(action.pairBet)
      if (pairBet > 0 && pairBet < MIN_PAIR_BET) return state
      return dealInitialHand({ ...state, pendingBet: bet, pendingPairBet: pairBet }, pairBet)
    }

    case 'continue_after_pair':
      return continueAfterPairReveal(state)

    case 'hit':
      if (state.phase !== 'playing') return state
      return hitHand(state)

    case 'stand':
      if (state.phase !== 'playing') return state
      return standHand(state)

    case 'double':
      if (state.phase !== 'playing') return state
      return doubleHand(state, action.additionalBet)

    case 'split':
      if (state.phase !== 'playing') return state
      return splitHand(state, action.additionalBet)

    case 'next_hand':
      if (state.phase !== 'resolved') return state
      return {
        ...state,
        phase: 'betting',
        playerHands: [],
        activeHandIndex: 0,
        dealerHand: [],
        dealerHoleRevealed: false,
        message: null,
        lastHandNet: 0,
        splitCount: 0,
        pairBetWager: 0,
        pairBetResult: null,
        pairBetPayout: 0,
        pairBetOriginalCards: null,
      }

    default:
      return state
  }
}

export function toSnapshot(state: TwentyOneState): TwentyOneSnapshot {
  const hand = activeHand(state)
  const bet =
    state.phase === 'playing' || state.phase === 'dealer'
      ? (hand?.bet ?? state.pendingBet)
      : state.pendingBet

  return {
    phase: state.phase,
    playerHands: state.playerHands,
    activeHandIndex: state.activeHandIndex,
    dealerHand: state.dealerHand,
    dealerHoleRevealed: state.dealerHoleRevealed,
    bet,
    pairBet: state.pairBetWager || state.pendingPairBet,
    pairBetResult: state.pairBetResult,
    pairBetPayout: state.pairBetPayout,
    pairBetOriginalCards: state.pairBetOriginalCards,
    totalStaked: totalStakedAmount(state),
    message: state.message,
    lastHandNet: state.lastHandNet,
    shoe: shoeSnapshot(state.shoe),
    splitCount: state.splitCount,
    resolutionId: state.resolutionId,
  }
}

export function getAdditionalBetForAction(
  state: TwentyOneState,
  action: 'double' | 'split',
): number {
  const hand = activeHand(state)
  if (!hand) return 0
  if (action === 'double') return hand.bet
  if (action === 'split') return hand.bet
  return 0
}

export function canPlayerAct(state: TwentyOneState): boolean {
  const hand = activeHand(state)
  return state.phase === 'playing' && hand?.status === 'active'
}

export { canDoubleHand, canSplitHand }
