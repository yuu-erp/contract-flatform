import { describe, expect, it } from 'vitest'
import { METRIC, revenue } from '../src/metrics'

function netRow(overrides: Partial<Record<number, bigint>>): bigint[] {
  const row = Array.from({ length: 32 }, () => 0n)
  for (const [idx, val] of Object.entries(overrides)) {
    row[Number(idx)] = val
  }
  return row
}

describe('revenue', () => {
  it('computes net service revenue and taxNet for NET', () => {
    const row = netRow({
      [METRIC.netGross]: 100_000n,
      [METRIC.netRefund]: 10_000n,
      [METRIC.netAdjUp]: 5_000n,
      [METRIC.netAdjDown]: 2_000n,
      [METRIC.netTax]: 9_090n,
      [METRIC.netTaxRefund]: 909n,
    })
    const r = revenue(row, 'NET')
    expect(r.net).toBe(93_000n)
    expect(r.taxNet).toBe(8_181n)
    expect(r.gross).toBe(100_000n)
  })

  it('ALL sums NET and IQR', () => {
    const row = netRow({
      [METRIC.netGross]: 10_000n,
      [METRIC.iqrGross]: 20_000n,
      [METRIC.netRefund]: 1_000n,
      [METRIC.iqrRefund]: 2_000n,
    })
    const r = revenue(row, 'ALL')
    expect(r.gross).toBe(30_000n)
    expect(r.refund).toBe(3_000n)
  })
})