import { describe, expect, it } from 'vitest'
import { ledgerKindsMaskFromBits, ledgerKindsMaskLabels, LEDGER_POSTER_BITS } from '../src/lib/ledger-poster'

describe('ledger poster mask', () => {
  it('gộp bit và nhãn', () => {
    const mask = ledgerKindsMaskFromBits([LEDGER_POSTER_BITS.Topup, LEDGER_POSTER_BITS.DirectSale])
    expect(mask).toBe((1 << 1) | (1 << 3))
    const labels = ledgerKindsMaskLabels(mask)
    expect(labels).toContain('Topup')
    expect(labels).toContain('Bán trực tiếp')
  })
})