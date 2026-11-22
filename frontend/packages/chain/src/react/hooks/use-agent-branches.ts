import { useQuery } from '@tanstack/react-query'
import { listAgentBranches } from '../../api/list-agent-branches'
import { useContracts } from '../contracts-context'

export function useAgentBranches(agentId: number | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agent-branches', agentId, 'registry'],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: () => listAgentBranches(contracts!.branches, agentId!),
  })
}