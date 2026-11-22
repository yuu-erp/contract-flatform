import type { LedgerPortionView } from '@meta-platform/chain'
import { describe, expect, it } from 'vitest'
import { bucketRowsFromPortions } from '../src/lib/wallet-buckets'

describe('bucketRowsFromPortions', () => {
  it('giữ thứ tự portions như contract trả về', () => {
    const portions: LedgerPortionView[] = [
      { branchId: 9, amount: 50_000n },
      { branchId: 2, amount: 120_000n },
      { branchId: 7, amount: 10_000n },
    ]
    expect(bucketRowsFromPortions(portions)).toEqual([
      { branchId: 9, amount: 50_000n },
      { branchId: 2, amount: 120_000n },
      { branchId: 7, amount: 10_000n },
    ])
  })
})