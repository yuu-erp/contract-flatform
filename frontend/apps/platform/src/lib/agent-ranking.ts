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