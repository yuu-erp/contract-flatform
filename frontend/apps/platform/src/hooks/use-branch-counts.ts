import { mapWithConcurrency, useContracts } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

export function useBranchCounts(agentIds: number[]) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['branch-counts', agentIds],
    enabled: !!contracts && agentIds.length > 0,
    queryFn: async () => {
      const pairs = await mapWithConcurrency(agentIds, 8, async (agentId) => {
        const count = await contracts!.branches.branchCountOf(agentId)
        return [agentId, count] as const
      })
      return new Map(pairs)
    },
  })
}

export function useTotalBranchCount(agentIds: number[]) {
  const query = useBranchCounts(agentIds)
  const total = [...(query.data?.values() ?? [])].reduce((a, b) => a + b, 0)
  return { ...query, total }
}