import { mapWithConcurrency, useContracts } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

export type AgentStatusCounts = {
  total: number
  active: number
  suspended: number
  deleted: number
}

/** Chỉ gọi `getAgent` (không profile) để đếm trạng thái — dùng card Hệ thống. */
export function useAgentStatusCounts() {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agents', 'status-counts'],
    enabled: !!contracts,
    queryFn: async (): Promise<AgentStatusCounts> => {
      const count = await contracts!.agents.agentCount()
      const ids = Array.from({ length: count }, (_, i) => count - i)
      const tallies = { active: 0, suspended: 0, deleted: 0 }
      await mapWithConcurrency(ids, 8, async (agentId) => {
        const agent = await contracts!.agents.getAgent(agentId)
        if (agent.status === 1) tallies.active++
        else if (agent.status === 2) tallies.suspended++
        else if (agent.status === 3) tallies.deleted++
      })
      return { total: count, ...tallies }
    },
  })
}