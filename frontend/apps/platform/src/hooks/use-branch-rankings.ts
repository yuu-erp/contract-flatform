import {
  chunkDays,
  mapWithConcurrency,
  revenue,
  sumDays,
  useContracts,
  type ServiceFilter,
} from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'
import { SCOPE_BRANCH } from '../lib/scopes'

export type BranchRankingRow = {
  branchId: number
  name: string
  net: bigint
}

export function useBranchRankings(
  branches: { branchId: number; name: string }[],
  fromDay: number,
  toDay: number,
  service: ServiceFilter,
) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['branch-rankings', branches.map((b) => b.branchId), fromDay, toDay, service],
    enabled: !!contracts?.ledger && branches.length > 0 && fromDay <= toDay,
    queryFn: async (): Promise<BranchRankingRow[]> => {
      const ledger = contracts!.ledger
      const rows = await mapWithConcurrency(branches, 8, async (branch) => {
        const chunks = chunkDays(fromDay, toDay)
        const daily: bigint[][] = []
        for (const [from, to] of chunks) {
          daily.push(...(await ledger.rollup(SCOPE_BRANCH, branch.branchId, from, to)))
        }
        const rev = revenue(sumDays(daily), service)
        return { branchId: branch.branchId, name: branch.name, net: rev.net }
      })
      return rows.sort((a, b) => (a.net === b.net ? a.branchId - b.branchId : a.net > b.net ? -1 : 1))
    },
  })
}