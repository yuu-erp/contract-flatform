import { describe, expect, it } from 'vitest'
import { predictAccess, type CallerKind, type MatrixAction } from './roles'

const CALLERS: CallerKind[] = ['owner', 'manager', 'staff', 'other']
const ACTIONS: MatrixAction[] = [
  'grantManager',
  'grantStaffNew',
  'grantChangeRole',
  'revokeManager',
  'revokeStaff',
  'renounceSelf',
]

/** Đúng 6 dòng mục 3 core-access.md, theo thứ tự cột chủ agent, manager, staff, khác. */
const EXPECTED: Record<MatrixAction, boolean[]> = {
  grantManager: [true, false, false, false],
  grantStaffNew: [true, true, false, false],
  grantChangeRole: [true, false, false, false],
  revokeManager: [true, false, false, false],
  revokeStaff: [true, true, false, false],
  renounceSelf: [false, true, true, false],
}

describe('predictAccess', () => {
  it('khớp 6 dòng ma trận cho 4 vai trò', () => {
    for (const action of ACTIONS) {
      CALLERS.forEach((caller, index) => {
        expect(predictAccess(action, caller).allowed, `${action} ${caller}`).toBe(EXPECTED[action][index])
      })
    }
  })
})
