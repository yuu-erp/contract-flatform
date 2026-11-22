import { describe, expect, it, vi } from 'vitest'
import type { BranchProfileRecord } from '../src/decode'
import type { BranchRegistryApi } from '../src/api'
import { listAgentBranches } from '../src/api/list-agent-branches'

const profile = (branchId: number, agentId: number): BranchProfileRecord => ({
  version: 1,
  branchId,
  agentId,
  domain: `b${branchId}.vn`,
  profile: { name: `CN ${branchId}`, location: '', phone: '', longlat: '', note: '' },
  updatedAt: 1,
})

describe('listAgentBranches', () => {
  it('trả rỗng khi branchCountOf = 0', async () => {
    const branches = {
      branchCountOf: vi.fn(async () => 0),
    } as unknown as BranchRegistryApi
    await expect(listAgentBranches(branches, 101)).resolves.toEqual([])
  })

  it('gom chi nhánh đúng agent qua getBranch/getBranchProfile', async () => {
    const branches = {
      branchCountOf: vi.fn(async () => 1),
      mainBranchOf: vi.fn(async () => 1),
      branchCount: vi.fn(async () => 2),
      getBranch: vi.fn(async (id: number) => ({
        id,
        agentId: id === 1 ? 101 : 99,
        status: 1,
        services: 1,
        isMain: true,
        tzOffsetMinutes: 420,
        domainHash: '0x',
        createdAt: 1,
        updatedAt: 1,
        profileDocId: 10n,
      })),
      getBranchProfile: vi.fn(async (id: number) => profile(id, id === 1 ? 101 : 99)),
    } as unknown as BranchRegistryApi

    const rows = await listAgentBranches(branches, 101)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.record.profile.name).toBe('CN 1')
  })
})