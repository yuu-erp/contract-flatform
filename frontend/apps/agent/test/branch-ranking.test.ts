import { METRIC } from '@meta-platform/chain'
import { describe, expect, it } from 'vitest'
import { branchMetricsFromDaily, sumRankingNet } from '../src/lib/branch-ranking'

function mockDay(net: bigint, served: bigint): bigint[] {
  const row = new Array(32).fill(0n)
  row[METRIC.netGross] = net + net / 8n
  row[METRIC.netTax] = net / 8n
  row[METRIC.netServedHere] = served
  return row
}

describe('sumRankingNet', () => {
  it('cộng đúng tổng thuần các chi nhánh', () => {
    const rows = [
      { net: 1_000_000n },
      { net: 2_500_000n },
      { net: 500_000n },
    ]
    expect(sumRankingNet(rows)).toBe(4_000_000n)
  })

  it('branchMetricsFromDaily khớp revenue + served', () => {
    const daily = [mockDay(900_000n, 100_000n), mockDay(100_000n, 50_000n)]
    const m = branchMetricsFromDaily(daily, 'ALL')
    expect(m.net).toBeGreaterThan(0n)
    expect(m.served).toBe(150_000n)
  })
})