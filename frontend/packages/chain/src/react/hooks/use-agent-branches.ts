import { useQuery } from '@tanstack/react-query'
import { decodeBranchProfileRecord } from '../../decode'
import { searchFullDB } from '../../search'
import { useContracts } from '../contracts-context'

export function useAgentBranches(agentId: number | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agent-branches', agentId],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: async () => {
      const page = await searchFullDB(contracts!.history, agentId!, 'platform_branches', {
        limit: 100,
        offset: 0,
      })
      return page.items.map((item) => ({
        docId: item.docId,
        record: decodeBranchProfileRecord(item.data),
      }))
    },
  })
}