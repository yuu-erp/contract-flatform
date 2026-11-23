import { describe, expect, it } from 'vitest'
import { resolveAgentAccess } from '../src/agent-access'
import { readDomainParam, withDomain } from '../src/read-domain'
import { Role } from '../src/roles'

const base = {
  connected: true,
  ownedAgentId: 0,
  branchIdByDomain: 0,
  managedBranches: [] as { branchId: number; agentId: number; domain: string; name: string }[],
}

describe('resolveAgentAccess — 9 quy tắc vai trò', () => {
  it('chưa kết nối ví → login', () => {
    expect(resolveAgentAccess({ ...base, connected: false })).toEqual({ kind: 'login' })
  })

  it('không domain, ví là chủ agent → owner', () => {
    expect(resolveAgentAccess({ ...base, ownedAgentId: 2, storeName: 'Cửa hàng' })).toMatchObject({
      kind: 'owner',
      agentId: 2,
      storeName: 'Cửa hàng',
    })
  })

  it('không domain, có chi nhánh quản lý → pick-branch', () => {
    const branches = [{ branchId: 1, agentId: 1, domain: 'a.mock', name: 'CN1' }]
    expect(resolveAgentAccess({ ...base, managedBranches: branches })).toEqual({
      kind: 'pick-branch',
      branches,
    })
  })

  it('không domain, không vai trò → no-access', () => {
    expect(resolveAgentAccess({ ...base })).toEqual({
      kind: 'no-access',
      message: 'Ví này không có quyền truy cập app agent.',
    })
  })

  it('có domain, branchByDomain = 0 → domain-not-found', () => {
    expect(resolveAgentAccess({ ...base, domain: 'khong-co.test', branchIdByDomain: 0 })).toEqual({
      kind: 'domain-not-found',
      domain: 'khong-co.test',
    })
  })

  it('có domain, agent/chi nhánh Deleted → domain-not-found', () => {
    expect(
      resolveAgentAccess({
        ...base,
        domain: 'dead.mock',
        branchIdByDomain: 9,
        branchStatus: 3,
        agentIdOfBranch: 11,
        agentStatus: 1,
      }),
    ).toEqual({ kind: 'domain-not-found', domain: 'dead.mock' })
  })

  it('có domain, ví là chủ agent của chi nhánh → owner + focus', () => {
    expect(
      resolveAgentAccess({
        ...base,
        domain: 'q1.vn',
        ownedAgentId: 1,
        storeName: 'Agent 1',
        branchIdByDomain: 5,
        branchStatus: 1,
        agentIdOfBranch: 1,
        agentStatus: 1,
        roleInBranch: Role.Owner,
      }),
    ).toMatchObject({
      kind: 'owner',
      agentId: 1,
      focusBranchId: 5,
      focusDomain: 'q1.vn',
    })
  })

  it('có domain, Manager → manager', () => {
    expect(
      resolveAgentAccess({
        ...base,
        domain: 'cn1.mock',
        branchIdByDomain: 3,
        branchStatus: 1,
        agentIdOfBranch: 1,
        agentStatus: 1,
        roleInBranch: Role.Manager,
        branchName: 'Chi nhánh 1',
        storeName: 'Cửa A',
      }),
    ).toMatchObject({
      kind: 'manager',
      agentId: 1,
      branchId: 3,
      domain: 'cn1.mock',
    })
  })

  it('có domain, Staff hoặc None → no-access', () => {
    expect(
      resolveAgentAccess({
        ...base,
        domain: 'cn1.mock',
        branchIdByDomain: 3,
        branchStatus: 1,
        agentIdOfBranch: 1,
        agentStatus: 1,
        roleInBranch: Role.Staff,
      }),
    ).toEqual({
      kind: 'no-access',
      domain: 'cn1.mock',
      message: 'Ví này không phải quản lý của cn1.mock',
    })
  })
})

describe('readDomainParam / withDomain', () => {
  it('chuẩn hoá domain', () => {
    expect(readDomainParam('?domain=%20Q1.VN%20')).toBe('q1.vn')
  })

  it('withDomain giữ query', () => {
    expect(withDomain('/staff', 'q1.vn')).toBe('?domain=q1.vn#/staff')
    expect(withDomain('/staff')).toBe('/staff')
  })
})