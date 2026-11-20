import { useQuery } from '@tanstack/react-query'
import type { LedgerApi } from '../../api'
import { chunkDays } from '../../days'

export type UseRollupArgs = {
  ledger: LedgerApi | null
  scope: number
  id: number
  fromDay: number
  toDay: number
  enabled?: boolean
}

export function useRollup({ ledger, scope, id, fromDay, toDay, enabled = true }: UseRollupArgs) {
  return useQuery({
    queryKey: ['rollup', scope, id, fromDay, toDay],
    enabled: enabled && !!ledger && fromDay <= toDay,
    queryFn: async (): Promise<bigint[][]> => {
      const chunks = chunkDays(fromDay, toDay)
      const rows: bigint[][] = []
      for (const [from, to] of chunks) {
        const part = await ledger!.rollup(scope, id, from, to)
        rows.push(...part)
      }
      return rows
    },
  })
}