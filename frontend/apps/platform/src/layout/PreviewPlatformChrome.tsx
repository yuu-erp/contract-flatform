import { useContracts } from '@meta-platform/chain'
import {
  AppShell,
  PageLoader,
  SidebarWallet,
  StatusBadge,
  ThemeToggle,
  WalletSwitcher,
  useWalletTheme,
} from '@meta-platform/ui'
import { LayoutDashboard, ScrollText, Settings, Users, type LucideIcon } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PlatformRoleStrip } from '../components/PlatformRoleStrip'
import { PlatformRoleStatus } from '../components/PlatformRoleStatus'
import { platformChainId } from '../config/deployments'
import { useDashboardTitle } from '../hooks/use-dashboard-title'
import { usePlatformRole } from '../hooks/use-platform-role'
import { PreviewRoleMenu } from '../preview/PreviewRoleMenu'
import { useActiveWallet } from '@meta-platform/chain'

const menuBase: { to: string; label: string; end?: boolean; icon: LucideIcon }[] = [
  { to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard },
  { to: '/agents', label: 'Agent', icon: Users },
  { to: '/audit', label: 'Nhật ký', icon: ScrollText },
  { to: '/system', label: 'Hệ thống', icon: Settings },
]

function PreviewSession() {
  const { role, loading } = usePlatformRole()
  const { data: wallet } = useActiveWallet()
  const location = useLocation()

  if (loading) {
    return <PageLoader message="Đang kiểm tra quyền on-chain…" />
  }

  if (!role?.isOwner && !role?.isAdmin && !role?.isPendingOwner) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {wallet?.address ? (
          <PlatformRoleStatus walletAddress={wallet.address} role={role} checking={false} />
        ) : null}
        <PreviewRoleMenu />
      </div>
    )
  }

  if (!role.isOwner && location.pathname.startsWith('/system')) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <PreviewRoleMenu />
      {wallet?.address ? (
        <PlatformRoleStrip walletAddress={wallet.address} role={role} checking={loading} />
      ) : null}
      <Outlet />
    </div>
  )
}

export function PreviewPlatformChrome() {
  const contracts = useContracts()
  const { role, loading, paused } = usePlatformRole()
  const pageTitle = useDashboardTitle()
  useWalletTheme()
  const roleBadge =
    role && !loading ? (
      <StatusBadge kind="role" value={role.isOwner ? 3 : 2} className="hidden lg:inline-flex" />
    ) : null

  if (!contracts) return <PageLoader message="Đang tải dữ liệu giả…" />

  return (
    <AppShell
      title="Meta Platform"
      subtitle="Xem trước (mock)"
      menu={menuBase}
      chainLabel={String(platformChainId)}
      sidebarFooter={<SidebarWallet />}
      headerWallet={<WalletSwitcher className="shrink-0 md:hidden" />}
      topbarTitle={pageTitle}
      headerExtra={<ThemeToggle />}
      roleBadge={roleBadge}
      paused={paused}
      main={<PreviewSession />}
    />
  )
}