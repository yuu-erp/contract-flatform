import { useQuery } from '@tanstack/react-query'
import { useContracts } from '../contracts-context'

export function useAgent(agentId: number | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agent', agentId],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: async () => {
      const [agent, profile] = await Promise.all([
        contracts!.agents.getAgent(agentId!),
        contracts!.agents.getAgentProfile(agentId!),
      ])
      return { agent, profile }
    },
  })
}