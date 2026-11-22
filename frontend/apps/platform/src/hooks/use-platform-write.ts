import { usePlatformRole } from './use-platform-role'

/** Ghi agent/chi nhánh chỉ PLATFORM_ADMIN; Owner chỉ xem (contract). */
export function usePlatformWrite() {
  const { role, paused } = usePlatformRole()
  const canWrite = Boolean(role?.isAdmin && !paused)
  const adminOnlyHint = role?.isOwner && !role.isAdmin ? 'Chỉ Admin' : !role?.isAdmin ? 'Chỉ Admin' : paused ? 'Hệ đang pause' : null
  return { canWrite, adminOnlyHint, paused, isOwner: Boolean(role?.isOwner), isAdmin: Boolean(role?.isAdmin) }
}