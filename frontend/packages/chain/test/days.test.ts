import { describe, expect, it } from 'vitest'
import { chunkDays, dayOf } from '../src/days'

describe('days', () => {
  it('dayOf matches LedgerMetrics.t.sol', () => {
    expect(dayOf(1_767_200_399, 420)).toBe(20_453)
    expect(dayOf(1_767_200_400, 420)).toBe(20_454)
    expect(dayOf(90_000, -60)).toBe(1)
  })

  it('chunkDays splits beyond 93-day rollup limit', () => {
    expect(chunkDays(0, 199)).toEqual([
      [0, 92],
      [93, 185],
      [186, 199],
    ])
  })
})