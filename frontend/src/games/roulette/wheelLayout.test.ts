import { describe, expect, it } from 'vitest'
import { landingRotation, WHEEL_ORDER } from './wheelLayout'

describe('landingRotation', () => {
  it('returns a positive rotation for every pocket', () => {
    for (const pocket of WHEEL_ORDER) {
      expect(landingRotation(pocket)).toBeGreaterThan(0)
    }
  })

  it('includes multiple full rotations', () => {
    expect(landingRotation(0)).toBeGreaterThanOrEqual(5 * 360)
  })
})
