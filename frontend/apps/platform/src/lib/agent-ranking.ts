import { matchAgent, type AgentSearchRow } from '@meta-platform/chain'

export type AgentRankingRow = {
  agentId: number
  name?: string
  owner: string
  net: bigint
  gross: bigint
}

export function sortAgentRankings(rows: AgentRankingRow[]): AgentRankingRow[] {
  return [...rows].sort((a, b) => {
    if (a.net === b.net) return a.agentId - b.agentId
    return a.net > b.net ? -1 : 1
  })
}

export function filterAgentRankings(
  rows: AgentRankingRow[],
  agents: AgentSearchRow[],
  q: string,
): AgentRankingRow[] {
  const query = q.trim()
  if (!query) return rows
  const byId = new Map(agents.map((a) => [a.id, a]))
  return rows.filter((row) => {
    const agent = byId.get(row.agentId)
    return agent ? matchAgent(agent, query) : false
  })
}