import { describe, expect, it } from 'vitest'
import { formatTadpolesFixed, normalizeTadpoles } from './tadpoleAmount'

describe('normalizeTadpoles', () => {
  it('preserves half-tadpole amounts for 3:2 payouts', () => {
    expect(normalizeTadpoles(2.5)).toBe(2.5)
    expect(normalizeTadpoles(1.5)).toBe(1.5)
  })

  it('keeps whole-tadpole amounts unchanged', () => {
    expect(normalizeTadpoles(17)).toBe(17)
  })
})

describe('formatTadpolesFixed', () => {
  it('always shows two decimal places', () => {
    expect(formatTadpolesFixed(17)).toBe('17.00')
    expect(formatTadpolesFixed(2.5)).toBe('2.50')
  })
})
