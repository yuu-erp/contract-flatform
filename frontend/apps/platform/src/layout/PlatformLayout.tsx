import { formatWalletAddress, useActiveWallet } from '@meta-platform/chain'
import { AppShell, NoAccessScreen } from '@meta-platform/ui'
import { usePlatformRole } from '../hooks/use-platform-role'

const menuBase = [
  { to: '/', label: 'Tổng quan', end: true },
  { to: '/agents', label: 'Agent' },
  { to: '/audit', label: 'Nhật ký' },
]

export function PlatformLayout() {
  const { data: wallet } = useActiveWallet()
  const { role, loading, paused } = usePlatformRole()

  if (!wallet?.address) {
    return null
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang kiểm tra quyền…</p>
  }

  if (!role?.isOwner && !role?.isAdmin) {
    return <NoAccessScreen title="Không có quyền" description="Ví này không phải Owner hay Admin nền tảng." />
  }

  const menu = role.isOwner ? [...menuBase, { to: '/system', label: 'Hệ thống' }] : menuBase
  const roleLabel = role.isOwner ? 'Owner' : 'Admin'

  return (
    <AppShell
      title="Nền tảng"
      menu={menu}
      chainLabel="Chain 991"
      walletAddress={formatWalletAddress(wallet.address)}
      roleBadge={<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">{roleLabel}</span>}
      paused={paused}
    />
  )
}