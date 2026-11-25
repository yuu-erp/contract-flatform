import { platformPermissions } from '@meta-platform/chain'
import { usePlatformRole } from './use-platform-role'

/** Quyền ghi tầng nền tảng: owner hoặc admin ghi agent/chi nhánh; việc cấu hình hệ chỉ owner. */
export function usePlatformWrite() {
  const { role, paused } = usePlatformRole()
  const perm = platformPermissions(role, paused)
  return {
    ...perm,
    paused,
    canWrite: perm.canWriteTenants,
    adminOnlyHint: perm.tenantWriteBlockedReason,
  }
}
