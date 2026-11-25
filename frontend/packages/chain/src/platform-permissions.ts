import type { PlatformRole } from './roles'

/**
 * Quyền tầng nền tảng — khớp contract (quyết định 2026-11-25):
 * - Owner cao nhất: làm được mọi việc của admin + việc chỉ owner.
 * - Admin: vận hành (agent, chi nhánh, pause/unpause). Không nâng cấp contract, không cấu hình hệ.
 * - Khi hệ đang pause, mọi ghi agent/chi nhánh bị chặn; chỉ còn unpause.
 */
export type PlatformPermissions = {
  isOwner: boolean
  isAdmin: boolean
  /** Owner hoặc admin. */
  isOperator: boolean
  /** Tạo/sửa/xoá agent và chi nhánh (cần hệ không pause). */
  canWriteTenants: boolean
  canPause: boolean
  canUnpause: boolean
  /** Thêm/bớt admin, đổi owner, poster, writer, nguồn vai trò, nâng cấp contract. */
  canManageSystem: boolean
  /** Lý do nút ghi agent/chi nhánh bị khoá; null khi được ghi. */
  tenantWriteBlockedReason: string | null
  /** Lý do mục cấu hình hệ bị khoá; null khi được ghi. */
  systemBlockedReason: string | null
}

export function platformPermissions(role: PlatformRole | undefined | null, paused: boolean): PlatformPermissions {
  const isOwner = Boolean(role?.isOwner)
  const isAdmin = Boolean(role?.isAdmin)
  const isOperator = isOwner || isAdmin
  const canWriteTenants = isOperator && !paused
  return {
    isOwner,
    isAdmin,
    isOperator,
    canWriteTenants,
    canPause: isOperator && !paused,
    canUnpause: isOperator && paused,
    canManageSystem: isOwner,
    tenantWriteBlockedReason: !isOperator
      ? 'Cần ví Owner hoặc Admin nền tảng'
      : paused
        ? 'Hệ đang tạm dừng'
        : null,
    systemBlockedReason: isOwner ? null : 'Chỉ Owner nền tảng',
  }
}
