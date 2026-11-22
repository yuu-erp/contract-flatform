import { useQuery } from '@tanstack/react-query'
import { fetchAgentBranches } from '../../api/fetch-agent-branches'
import { useContracts } from '../contracts-context'

export function useAgentBranches(agentId: number | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agent-branches', agentId, 'search'],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: async () => {
      return fetchAgentBranches(contracts!.history, contracts!.branches, agentId!)
    },
  })
}