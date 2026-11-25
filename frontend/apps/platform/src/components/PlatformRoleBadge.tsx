import type { PlatformRole } from '@meta-platform/chain'

/** Huy hiệu vai trò nền tảng ở header (không dùng nhãn vai trò agent). */
export function PlatformRoleBadge({ role }: { role: PlatformRole }) {
  const label = role.isOwner ? 'Owner nền tảng' : role.isAdmin ? 'Admin nền tảng' : role.isPendingOwner ? 'Chờ nhận owner' : null
  if (!label) return null
  return (
    <span className="hidden items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground lg:inline-flex">
      {label}
    </span>
  )
}
