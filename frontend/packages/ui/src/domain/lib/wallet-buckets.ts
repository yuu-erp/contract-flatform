import type { LedgerPortionView } from '@meta-platform/chain'

export type WalletBucketRow = { branchId: number; amount: bigint }

/** Không sắp xếp lại — UI hiển thị đúng thứ tự `bucketsOf` trả về. */
export function bucketRowsFromPortions(portions: LedgerPortionView[]): WalletBucketRow[] {
  return portions.map((p) => ({ branchId: p.branchId, amount: p.amount }))
}