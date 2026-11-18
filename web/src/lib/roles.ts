/** 0 None, 1 Staff, 2 Manager, 3 Owner. Owner không lưu trong AgentAccess. */
export const ROLE_NONE = 0
export const ROLE_STAFF = 1
export const ROLE_MANAGER = 2
export const ROLE_OWNER = 3

export const ROLE_LABEL: Record<number, string> = {
  [ROLE_NONE]: 'Không vai trò',
  [ROLE_STAFF]: 'Nhân viên',
  [ROLE_MANAGER]: 'Quản lý',
  [ROLE_OWNER]: 'Chủ agent',
}

/** Bốn cột ma trận mục 3 của docs/modules/core-access.md. */
export type CallerKind = 'owner' | 'manager' | 'staff' | 'other'

/** Sáu dòng ma trận. `renounceSelf` là chính thành viên đó gọi. */
export type MatrixAction =
  | 'grantManager'
  | 'grantStaffNew'
  | 'grantChangeRole'
  | 'revokeManager'
  | 'revokeStaff'
  | 'renounceSelf'

const MATRIX: Record<MatrixAction, Record<CallerKind, boolean>> = {
  grantManager: { owner: true, manager: false, staff: false, other: false },
  grantStaffNew: { owner: true, manager: true, staff: false, other: false },
  grantChangeRole: { owner: true, manager: false, staff: false, other: false },
  revokeManager: { owner: true, manager: false, staff: false, other: false },
  revokeStaff: { owner: true, manager: true, staff: false, other: false },
  renounceSelf: { owner: false, manager: true, staff: true, other: false },
}

export type AccessPrediction = {
  allowed: boolean
  message: string
}

const ACTION_LABEL: Record<MatrixAction, string> = {
  grantManager: 'cấp Manager',
  grantStaffNew: 'cấp Staff cho ví chưa có vai trò',
  grantChangeRole: 'đổi Staff ↔ Manager',
  revokeManager: 'thu Manager',
  revokeStaff: 'thu Staff',
  renounceSelf: 'tự rời chi nhánh',
}

/** Dự đoán quyền thuần, không gọi chain. Khớp 6 dòng × 4 vai trò ở mục 3. */
export function predictAccess(action: MatrixAction, caller: CallerKind): AccessPrediction {
  const allowed = MATRIX[action][caller]
  const what = ACTION_LABEL[action]
  if (allowed) return { allowed: true, message: `Dự đoán: được phép ${what}.` }
  return { allowed: false, message: `Dự đoán: bị từ chối (NotAuthorized) khi ${what}.` }
}

export function callerKindFromRole(role: number, isAgentOwner: boolean): CallerKind {
  if (isAgentOwner || role === ROLE_OWNER) return 'owner'
  if (role === ROLE_MANAGER) return 'manager'
  if (role === ROLE_STAFF) return 'staff'
  return 'other'
}

/** Chọn dòng ma trận cho grantRole dựa trên vai trò đang lưu của ví nhận. */
export function grantAction(nextRole: number, currentRole: number): MatrixAction | null {
  if (nextRole !== ROLE_STAFF && nextRole !== ROLE_MANAGER) return null
  if (currentRole === nextRole) return null
  if (currentRole === ROLE_NONE) return nextRole === ROLE_MANAGER ? 'grantManager' : 'grantStaffNew'
  if (
    (currentRole === ROLE_STAFF && nextRole === ROLE_MANAGER) ||
    (currentRole === ROLE_MANAGER && nextRole === ROLE_STAFF)
  ) {
    return 'grantChangeRole'
  }
  return null
}

export function revokeAction(currentRole: number): MatrixAction | null {
  if (currentRole === ROLE_MANAGER) return 'revokeManager'
  if (currentRole === ROLE_STAFF) return 'revokeStaff'
  return null
}

export function predictPlatformWrite(action: 'createAgent' | 'createBranch', isPlatformAdmin: boolean, paused: boolean): AccessPrediction {
  const label = action === 'createAgent' ? 'tạo agent' : 'tạo chi nhánh'
  if (paused) return { allowed: false, message: `Dự đoán: bị từ chối (EnforcedPause) khi ${label}.` }
  if (!isPlatformAdmin) return { allowed: false, message: `Dự đoán: bị từ chối (NotPlatformAdmin) khi ${label}.` }
  return { allowed: true, message: `Dự đoán: được phép ${label}.` }
}
