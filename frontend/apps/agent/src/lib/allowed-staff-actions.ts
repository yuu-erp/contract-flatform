import { normalizeHexAddress, Role } from '@meta-platform/chain'

export type StaffAction =
  | 'grantManager'
  | 'grantStaff'
  | 'demoteToStaff'
  | 'promoteToManager'
  | 'revoke'
  | 'renounce'

export type StaffViewer =
  | { kind: 'owner' }
  | { kind: 'manager'; account: string; branchId: number }

export type StaffTarget =
  | { kind: 'none' }
  | { kind: 'member'; account: string; role: number }
  | { kind: 'self' }

export function allowedStaffActions(viewer: StaffViewer, target: StaffTarget): StaffAction[] {
  const out = new Set<StaffAction>()

  if (viewer.kind === 'owner') {
    if (target.kind === 'none') {
      out.add('grantManager')
      out.add('grantStaff')
    } else if (target.kind === 'member') {
      if (target.role === Role.Manager) {
        out.add('demoteToStaff')
        out.add('revoke')
      } else if (target.role === Role.Staff) {
        out.add('promoteToManager')
        out.add('revoke')
      }
    }
    return [...out]
  }

  if (viewer.kind === 'manager') {
    if (target.kind === 'none') {
      out.add('grantStaff')
    } else if (target.kind === 'self') {
      out.add('renounce')
    } else if (target.kind === 'member') {
      const same = normalizeHexAddress(target.account) === normalizeHexAddress(viewer.account)
      if (same) {
        out.add('renounce')
      } else if (target.role === Role.Staff) {
        out.add('revoke')
      }
    }
  }

  return [...out]
}