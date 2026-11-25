import { type PlatformRole } from '@meta-platform/chain'

export function platformRoleLabel(role: PlatformRole | undefined, checking: boolean): string {
  if (checking) return 'Đang kiểm tra quyền…'
  if (!role) return 'Chưa xác định'
  if (role.isOwner) return 'Owner nền tảng'
  if (role.isAdmin) return 'Admin nền tảng'
  if (role.isPendingOwner) return 'Chờ nhận quyền owner'
  return 'Không có quyền'
}
