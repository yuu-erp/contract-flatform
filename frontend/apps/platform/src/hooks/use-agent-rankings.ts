import {
  chunkDays,
  mapWithConcurrency,
  revenue,
  sumDays,
  useContracts,
  type AgentSearchRow,
  type ServiceFilter,
} from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { filterAgentRankings, sortAgentRankings, type AgentRankingRow } from '../lib/agent-ranking'
import { SCOPE_AGENT } from '../lib/scopes'

export function useAgentRankings(
  agents: AgentSearchRow[],
  fromDay: number,
  toDay: number,
  service: ServiceFilter,
  rankSearch: string,
) {
  const contracts = useContracts()

  const query = useQuery({
    queryKey: ['agent-rankings', agents.map((a) => a.id), fromDay, toDay, service],
    enabled: !!contracts?.ledger && agents.length > 0 && fromDay <= toDay,
    queryFn: async (): Promise<AgentRankingRow[]> => {
      const ledger = contracts!.ledger
      const rows = await mapWithConcurrency(agents, 8, async (agent) => {
        const chunks = chunkDays(fromDay, toDay)
        const daily: bigint[][] = []
        for (const [from, to] of chunks) {
          daily.push(...(await ledger.rollup(SCOPE_AGENT, agent.id, from, to)))
        }
        const summed = sumDays(daily)
        const rev = revenue(summed, service)
        return {
          agentId: agent.id,
          name: agent.profileName,
          owner: agent.owner,
          net: rev.net,
          gross: rev.gross,
        }
      })
      return sortAgentRankings(rows)
    },
  })

  const data = useMemo(
    () => filterAgentRankings(query.data ?? [], agents, rankSearch),
    [query.data, agents, rankSearch],
  )

  return { ...query, data }
}