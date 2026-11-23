import { describe, expect, it } from 'vitest'
import {
  mapAddressList,
  mapAddressPage,
  mapBranchIdList,
  mapMembers,
  mapRollup,
} from '../src/api/mappers'
import { asBigInt, unwrapNamed } from '../src/normalize'

const MEMBER = {
  account: '0x0000000000000000000000000000000000003001',
  role: 2,
  grantedBy: '0x0000000000000000000000000000000000000001',
  grantedAt: 1,
}

describe('SDK output có tên — mappers', () => {
  it('membersOf → out', () => {
    expect(mapMembers({ out: [MEMBER] })).toHaveLength(1)
    expect(mapMembers({ out: [MEMBER] })[0]!.role).toBe(2)
  })

  it('branchesOfAccount → out', () => {
    expect(mapBranchIdList({ out: ['3', '4'] })).toEqual([3, 4])
  })

  it('rollup → out', () => {
    const day = Array.from({ length: 32 }, () => 0n)
    day[0] = 42n
    expect(mapRollup({ out: [day] })[0]![0]).toBe(42n)
  })

  it('balanceOf → sum', () => {
    expect(asBigInt(unwrapNamed({ sum: '1500000' }, 'sum'))).toBe(1_500_000n)
  })

  it('platformAdmins → page', () => {
    expect(mapAddressPage({ page: ['0x0000000000000000000000000000000000000002'] })).toHaveLength(1)
  })

  it('agentRoleSources → out', () => {
    const out = mapAddressList({ out: ['0x00000000000000000000000000000000000000aa'] })
    expect(out[0]!.toLowerCase()).toBe('0x00000000000000000000000000000000000000aa')
  })
})