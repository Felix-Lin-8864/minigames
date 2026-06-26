import { useEffect, useRef, useState } from 'react'
import { CARD_DEAL_DELAY_MS } from '../cards/dealAnimation'
import {
  dealAnimationSignature,
  isHandCleared,
  orderedDealCards,
} from './cardDealAnimation'
import type { Card } from '../cards/types'
import type { BaccaratSnapshot } from './types'

export function useBaccaratCardDealAnimation(snapshot: BaccaratSnapshot) {
  const [visibleCards, setVisibleCards] = useState<Set<Card>>(() => new Set())
  const [isAnimating, setIsAnimating] = useState(false)
  const [dealSequenceComplete, setDealSequenceComplete] = useState(false)
  const prevSnapshotRef = useRef<BaccaratSnapshot | null>(null)
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

    for (const timeoutId of timeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    timeoutsRef.current = []

    if (isHandCleared(snapshot)) {
      setVisibleCards(new Set())
      setIsAnimating(false)
      setDealSequenceComplete(false)
      return
    }

    if (!snapshot.hand) return

    const ordered = orderedDealCards(snapshot.hand)
    if (ordered.length === 0) return

    if (snapshot.phase !== 'dealing') {
      setVisibleCards(new Set(ordered))
      setIsAnimating(false)
      setDealSequenceComplete(true)
      return
    }

    const steps: Array<() => void> = [
      () => {
        setVisibleCards(new Set())
        setDealSequenceComplete(false)
      },
      ...ordered.map((card) => () => {
        setVisibleCards((current) => {
          const next = new Set(current)
          next.add(card)
          return next
        })
      }),
    ]

    setIsAnimating(true)

    steps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => {
        step()
        if (index === steps.length - 1) {
          setIsAnimating(false)
          setDealSequenceComplete(true)
        }
      }, index * CARD_DEAL_DELAY_MS)
      timeoutsRef.current.push(timeoutId)
    })
  }, [snapshot])

  function isCardVisible(card: Card): boolean {
    return visibleCards.has(card)
  }

  return { isAnimating, isCardVisible, dealSequenceComplete }
}
