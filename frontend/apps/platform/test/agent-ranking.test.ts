import { describe, expect, it } from 'vitest'
import { sortAgentRankings, type AgentRankingRow } from '../src/lib/agent-ranking'

describe('sortAgentRankings', () => {
  const rows: AgentRankingRow[] = [
    { agentId: 1, net: 5_000n, gross: 0n, owner: '0x1', name: 'A' },
    { agentId: 2, net: 99_000n, gross: 0n, owner: '0x2', name: 'B' },
    { agentId: 3, net: 12_000n, gross: 0n, owner: '0x3', name: 'C' },
    { agentId: 4, net: 99_000n, gross: 0n, owner: '0x4', name: 'D' },
  ]

  it('sắp xếp theo doanh thu thuần giảm dần, ổn định id khi bằng nhau', () => {
    const sorted = sortAgentRankings(rows)
    expect(sorted.map((r) => r.agentId)).toEqual([2, 4, 3, 1])
  })
})