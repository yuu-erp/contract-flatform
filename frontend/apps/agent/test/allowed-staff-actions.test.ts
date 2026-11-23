import { Role } from '@meta-platform/chain'
import { describe, expect, it } from 'vitest'
import { allowedStaffActions } from '../src/lib/allowed-staff-actions'

const OWNER = { kind: 'owner' as const }
const MGR = { kind: 'manager' as const, account: '0x0000000000000000000000000000000000003001', branchId: 1 }

describe('allowedStaffActions', () => {
  it('chủ agent với Manager: đổi cấp và thu hồi', () => {
    expect(allowedStaffActions(OWNER, { kind: 'member', account: '0x1', role: Role.Manager }).sort()).toEqual(
      ['demoteToStaff', 'revoke'].sort(),
    )
  })

  it('chủ agent với Staff: thăng cấp và thu hồi', () => {
    expect(allowedStaffActions(OWNER, { kind: 'member', account: '0x2', role: Role.Staff }).sort()).toEqual(
      ['promoteToManager', 'revoke'].sort(),
    )
  })

  it('chủ agent với ví chưa có vai trò: cấp Manager hoặc Staff', () => {
    expect(allowedStaffActions(OWNER, { kind: 'none' }).sort()).toEqual(['grantManager', 'grantStaff'].sort())
  })

  it('manager với Staff khác: thu hồi', () => {
    expect(allowedStaffActions(MGR, { kind: 'member', account: '0x3004', role: Role.Staff })).toEqual(['revoke'])
  })

  it('manager với Manager khác: không hành động', () => {
    expect(allowedStaffActions(MGR, { kind: 'member', account: '0x9', role: Role.Manager })).toEqual([])
  })

  it('manager với ví chưa có vai trò: chỉ cấp Staff', () => {
    expect(allowedStaffActions(MGR, { kind: 'none' })).toEqual(['grantStaff'])
  })

  it('manager với chính mình: rời chi nhánh', () => {
    expect(allowedStaffActions(MGR, { kind: 'self' })).toEqual(['renounce'])
    expect(allowedStaffActions(MGR, { kind: 'member', account: MGR.account, role: Role.Manager })).toEqual([
      'renounce',
    ])
  })
})