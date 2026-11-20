import { formatWalletAddress } from '@meta-platform/chain'
import { type PlatformRole } from '@meta-platform/chain'

export function platformRoleLabel(role: PlatformRole | undefined, checking: boolean): string {
  if (checking) return 'Đang kiểm tra quyền…'
  if (!role) return 'Chưa xác định'
  if (role.isOwner) return 'Owner nền tảng'
  if (role.isAdmin) return 'Admin nền tảng'
  if (role.isPendingOwner) return 'Chờ nhận quyền owner'
  return 'Không có quyền'
}

export function PlatformRoleStatus({
  walletAddress,
  role,
  checking,
}: {
  walletAddress: string
  role: PlatformRole | undefined
  checking: boolean
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard nền tảng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ví {formatWalletAddress(walletAddress)} — {platformRoleLabel(role, checking)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {role?.isPendingOwner ? (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-900 dark:text-amber-100">
            Có thể nhận quyền owner
          </span>
        ) : null}
        {role?.isAdmin && !role.isOwner ? (
          <span className="rounded-full border border-border bg-muted px-2.5 py-1">Ghi agent/chi nhánh: Admin</span>
        ) : null}
        {role?.isOwner && !role.isAdmin ? (
          <span className="rounded-full border border-border bg-muted px-2.5 py-1">
            Owner: xem toàn hệ; ghi agent qua ví Admin
          </span>
        ) : null}
      </div>
    </div>
  )
}