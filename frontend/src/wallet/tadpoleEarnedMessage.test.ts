import { describe, expect, it } from 'vitest'
import { tadpoleEarnedMessage } from './tadpoleEarnedMessage'

describe('tadpoleEarnedMessage', () => {
  it('describes positive earnings with correct pluralization', () => {
    expect(tadpoleEarnedMessage(1)).toBe('You earned 1 tadpole!')
    expect(tadpoleEarnedMessage(17)).toBe('You earned 17 tadpoles!')
  })

  it('describes zero earnings', () => {
    expect(tadpoleEarnedMessage(0)).toBe('No tadpoles earned this round.')
  })
})
