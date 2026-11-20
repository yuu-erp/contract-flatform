import { formatWalletAddress, useActiveWallet, useConnectWallet } from '@meta-platform/chain'
import { ChevronsUpDown, Loader2 } from 'lucide-react'
import { useWalletTheme } from '../hooks/use-wallet-theme'
import { cn } from '../lib/cn'

function WalletAvatar({ seed, busy }: { seed: string; busy: boolean }) {
  if (busy) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </span>
    )
  }
  const hue = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
      style={{ background: `hsl(${hue} 45% 42%)` }}
      aria-hidden
    >
      {seed.slice(2, 4).toUpperCase()}
    </span>
  )
}

/** Nút chọn/đổi ví ở chân sidebar (mẫu web-admin `SidebarWallet`). */
export function SidebarWallet({ className }: { className?: string }) {
  const theme = useWalletTheme()
  const { data: wallet, isPending: isWalletLoading } = useActiveWallet()
  const connect = useConnectWallet(theme)

  const busy = isWalletLoading || connect.isPending
  const seed = wallet?.address ?? 'guest'
  const displayName = wallet?.name?.trim() || (wallet ? 'Ví đang chọn' : 'Chưa có ví')
  const subtitle = wallet
    ? formatWalletAddress(wallet.address)
    : busy
      ? 'Đang tải…'
      : 'Nhấn để chọn ví'

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void connect.mutate()}
      className={cn(
        'flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background p-2 text-left outline-none',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      aria-label={wallet ? `Đổi ví ${displayName}` : 'Chọn ví'}
    >
      <WalletAvatar seed={seed} busy={busy} />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  )
}