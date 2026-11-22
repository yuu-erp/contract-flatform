import type { AgentSearchRow } from '@meta-platform/chain'
import { describe, expect, it } from 'vitest'
import { filterAgentRankings, sortAgentRankings, type AgentRankingRow } from '../src/lib/agent-ranking'

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

  it('lọc xếp hạng bằng matchAgent (tên không dấu)', () => {
    const agents: AgentSearchRow[] = [
      { id: 1, owner: '0x1', status: 1, allowedServices: 7, profileName: 'Shop A' },
      { id: 2, owner: '0x2', status: 1, allowedServices: 7, profileName: 'Cyber Quận 1' },
      { id: 3, owner: '0x3', status: 1, allowedServices: 7, profileName: 'Other' },
    ]
    const ranked: AgentRankingRow[] = [
      { agentId: 1, net: 1n, gross: 0n, owner: '0x1', name: 'Shop A' },
      { agentId: 2, net: 2n, gross: 0n, owner: '0x2', name: 'Cyber Quận 1' },
      { agentId: 3, net: 3n, gross: 0n, owner: '0x3', name: 'Other' },
    ]
    const filtered = filterAgentRankings(ranked, agents, 'quan 1')
    expect(filtered.map((r) => r.agentId)).toEqual([2])
  })
})