import { formatWalletAddress, type PlatformRole } from '@meta-platform/chain'
import { platformRoleLabel } from './PlatformRoleStatus'

/** Dải trạng thái ví/quyền gọn — không lặp tiêu đề trang. */
export function PlatformRoleStrip({
  walletAddress,
  role,
  checking,
}: {
  walletAddress: string
  role: PlatformRole | undefined
  checking: boolean
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm">
      <span className="font-medium text-foreground">{formatWalletAddress(walletAddress)}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{platformRoleLabel(role, checking)}</span>
      {role?.isPendingOwner ? (
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-900 dark:text-amber-100">
          Chờ nhận owner
        </span>
      ) : null}
    </div>
  )
}