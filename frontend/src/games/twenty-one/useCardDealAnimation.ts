import { useEffect, useRef, useState } from 'react'
import {
  CARD_DEAL_DELAY_MS,
  dealAnimationSignature,
  findNewCards,
  isInitialDeal,
  isSnapshotCleared,
  shouldFlipDealerHole,
  sortCardsForDealAnimation,
} from './cardDealAnimation'
import type { Card, TwentyOneSnapshot } from './types'

export function useCardDealAnimation(snapshot: TwentyOneSnapshot) {
  const [visibleCards, setVisibleCards] = useState<Set<Card>>(() => new Set())
  const [dealerHoleFlipped, setDealerHoleFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevSnapshotRef = useRef<TwentyOneSnapshot | null>(null)
  const prevSignatureRef = useRef('')
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutsRef.current) {
        window.clearTimeout(timeoutId)
      }
      timeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    const signature = dealAnimationSignature(snapshot)
    if (signature === prevSignatureRef.current) return

    const prev = prevSnapshotRef.current
    prevSnapshotRef.current = snapshot
    prevSignatureRef.current = signature

    if (prev === null) return

    if (isSnapshotCleared(snapshot)) {
      for (const timeoutId of timeoutsRef.current) {
        window.clearTimeout(timeoutId)
      }
      timeoutsRef.current = []
      setVisibleCards(new Set())
      setDealerHoleFlipped(false)
      setIsAnimating(false)
      return
    }

    const newCards = findNewCards(prev, snapshot)
    const flipHole = shouldFlipDealerHole(prev, snapshot)
    if (newCards.length === 0 && !flipHole) return

    for (const timeoutId of timeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    timeoutsRef.current = []

    const orderedCards = sortCardsForDealAnimation(newCards, snapshot)
    const steps: Array<() => void> = []

    if (isInitialDeal(newCards, snapshot)) {
      steps.push(() => {
        setVisibleCards(new Set())
        setDealerHoleFlipped(false)
      })
    }

    for (const card of orderedCards) {
      steps.push(() => {
        setVisibleCards((current) => {
          const next = new Set(current)
          next.add(card)
          return next
        })
      })
    }

    if (flipHole) {
      steps.push(() => {
        setDealerHoleFlipped(true)
      })
    }

    if (steps.length === 0) return

    setIsAnimating(true)

    steps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => {
        step()
        if (index === steps.length - 1) {
          setIsAnimating(false)
        }
      }, index * CARD_DEAL_DELAY_MS)
      timeoutsRef.current.push(timeoutId)
    })
  }, [snapshot])

  function isCardVisible(card: Card): boolean {
    return visibleCards.has(card)
  }

  function displayCard(card: Card, isDealerHole: boolean): Card {
    if (isDealerHole && dealerHoleFlipped) {
      return { ...card, faceUp: true }
    }
    return card
  }

  return {
    isAnimating,
    isCardVisible,
    displayCard,
    dealerHoleFlipped,
  }
}
