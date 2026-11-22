import { describe, expect, it, vi } from 'vitest'
import { fetchAgentBranches } from '../src/api/fetch-agent-branches'
import type { HistoryIndexContract } from '../src/contracts/history-index.contract'
import type { BranchRegistryApi } from '../src/api'

vi.mock('../src/search', () => ({
  searchFullDB: vi.fn(async () => ({ total: 1, items: [{ docId: 1, data: '0x' }] })),
}))

vi.mock('../src/decode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/decode')>()
  return {
    ...actual,
    decodeBranchProfileRecord: vi.fn(() => {
      throw new Error('bad abi')
    }),
  }
})

vi.mock('../src/api/list-agent-branches', () => ({
  listAgentBranches: vi.fn(async () => [
    {
      docId: 1,
      record: {
        version: 1,
        branchId: 1,
        agentId: 101,
        domain: 'a.vn',
        profile: { name: 'Fallback', location: '', phone: '', longlat: '', note: '' },
        updatedAt: 1,
      },
    },
  ]),
}))

describe('fetchAgentBranches', () => {
  it('fallback khi decode lỗi và hiện searchError', async () => {
    const branches = {
      branchCountOf: vi.fn(async () => 1),
      mainBranchOf: vi.fn(async () => 1),
    } as unknown as BranchRegistryApi
    const history = {} as HistoryIndexContract

    const result = await fetchAgentBranches(history, branches, 101)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]?.record.profile.name).toBe('Fallback')
    expect(result.searchError).toMatch(/Giải mã/)
  })
})