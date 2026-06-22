import { describe, expect, it } from 'vitest'
import { formatTadpolesFixed, formatSignedTadpolesFixed, normalizeTadpoles } from './tadpoleAmount'

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

describe('formatSignedTadpolesFixed', () => {
  it('prefixes positive and negative amounts', () => {
    expect(formatSignedTadpolesFixed(12.5)).toBe('+12.50')
    expect(formatSignedTadpolesFixed(-3)).toBe('-3.00')
    expect(formatSignedTadpolesFixed(0)).toBe('0.00')
  })
})
