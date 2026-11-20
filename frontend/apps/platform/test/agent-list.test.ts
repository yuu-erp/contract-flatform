import { describe, expect, it } from 'vitest'
import {
  filterAndSearchAgents,
  paginateAgents,
  type AgentListRow,
} from '../src/lib/agent-list'
import { matchAgent } from '@meta-platform/chain'

function makeAgents(n: number): AgentListRow[] {
  return Array.from({ length: n }, (_, i) => {
    const id = i + 1
    return {
      id,
      owner:
        id === 12
          ? '0xAbCdEf0123456789012345678901234567890abcd'
          : `0x${id.toString(16).padStart(40, 'a')}`,
      status: id % 3 === 0 ? 2 : 1,
      allowedServices: id % 2 === 0 ? 3 : 1,
      profileName: id === 12 ? 'Cyber Quận 1' : `Agent ${id}`,
      storePhone: id === 12 ? '028 3822 0000' : '',
      storeAddress: '',
      createdAt: 1_700_000_000 + id,
    }
  })
}

describe('agent list (150 rows)', () => {
  const all = makeAgents(150)

  it('tìm theo tên không dấu / có dấu, SĐT, id, ví', () => {
    expect(matchAgent(all[11], 'cyber quan 1')).toBe(true)
    expect(matchAgent(all[11], '0283822')).toBe(true)
    expect(matchAgent(all[11], '12')).toBe(true)
    expect(matchAgent(all[11], '0xabc')).toBe(true)
    const filtered = filterAndSearchAgents(all, { q: 'cyber quan 1', status: null, servicesMask: null })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(12)
  })

  it('lọc trạng thái và dịch vụ', () => {
    const active = filterAndSearchAgents(all, { q: '', status: 1, servicesMask: null })
    expect(active.every((r) => r.status === 1)).toBe(true)
    const netOnly = filterAndSearchAgents(all, { q: '', status: null, servicesMask: 1 })
    expect(netOnly.every((r) => (r.allowedServices & 1) !== 0)).toBe(true)
  })

  it('phân trang 20', () => {
    const page1 = paginateAgents(all, 1, 20)
    const page2 = paginateAgents(all, 2, 20)
    expect(page1.items).toHaveLength(20)
    expect(page1.totalPages).toBe(8)
    expect(page1.items[0].id).toBe(1)
    expect(page2.items[0].id).toBe(21)
  })
})