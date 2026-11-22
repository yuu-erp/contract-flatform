import {
  ContractsProvider,
  useActiveWallet,
  useConnectWallet,
  usePlatformContracts,
} from '@meta-platform/chain'
import {
  AppShell,
  LoginCard,
  NoAccessScreen,
  PageLoader,
  SidebarWallet,
  StatusBadge,
  ThemeToggle,
  WalletSwitcher,
  useWalletTheme,
} from '@meta-platform/ui'
import { LayoutDashboard, ScrollText, Settings, Users, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PlatformRoleStrip } from '../components/PlatformRoleStrip'
import { PlatformRoleStatus } from '../components/PlatformRoleStatus'
import { platformChainId, platformDeployments } from '../config/deployments'
import { useDashboardTitle } from '../hooks/use-dashboard-title'
import { usePlatformRole } from '../hooks/use-platform-role'

const menuBase: { to: string; label: string; end?: boolean; icon: LucideIcon }[] = [
  { to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard },
  { to: '/agents', label: 'Agent', icon: Users },
  { to: '/audit', label: 'Nhật ký', icon: ScrollText },
  { to: '/system', label: 'Hệ thống', icon: Settings },
]

function PlatformSession() {
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
        <NoAccessScreen
          title="Không có quyền"
          description="Ví này không phải Owner hay Admin nền tảng. Chọn ví khác ở sidebar hoặc header."
        />
      </div>
    )
  }

  if (!role.isOwner && location.pathname.startsWith('/system')) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      {wallet?.address ? (
        <PlatformRoleStrip walletAddress={wallet.address} role={role} checking={loading} />
      ) : null}
      <Outlet />
    </div>
  )
}

function PlatformChromeWithContracts() {
  const { role, loading, paused } = usePlatformRole()
  const pageTitle = useDashboardTitle()
  const roleBadge =
    role && !loading ? (
      <StatusBadge kind="role" value={role.isOwner ? 3 : 2} className="hidden lg:inline-flex" />
    ) : null

  return (
    <AppShell
      title="Meta Platform"
      subtitle="Dashboard nền tảng"
      menu={menuBase}
      chainLabel={String(platformChainId)}
      sidebarFooter={<SidebarWallet />}
      headerWallet={<WalletSwitcher className="shrink-0 md:hidden" />}
      topbarTitle={pageTitle}
      headerExtra={<ThemeToggle />}
      roleBadge={roleBadge}
      paused={paused}
      main={<PlatformSession />}
    />
  )
}

export function PlatformChrome() {
  const theme = useWalletTheme()
  const { data: wallet, isPending: walletLoading } = useActiveWallet()
  const connect = useConnectWallet(theme)
  const contracts = usePlatformContracts(platformChainId, platformDeployments)

  const shellProps = {
    title: 'Meta Platform' as const,
    subtitle: 'Dashboard nền tảng' as const,
    menu: menuBase,
    chainLabel: String(platformChainId),
    sidebarFooter: <SidebarWallet />,
    headerWallet: <WalletSwitcher className="shrink-0 md:hidden" />,
    headerExtra: <ThemeToggle />,
    topbarTitle: 'Chào mừng',
  }

  let main: ReactNode

  if (walletLoading) {
    main = <PageLoader message="Đang tải ví…" />
  } else if (!wallet) {
    main = (
      <LoginCard
        heading="Dashboard nền tảng"
        intro="Đăng nhập ví Meta để xem doanh thu và quản lý agent on-chain."
        cardTitle="Chọn ví"
        cardDescription="Cần ví được cấp Owner hoặc Admin nền tảng (PLATFORM_ADMIN)."
        pending={connect.isPending}
        onLogin={() => connect.mutate()}
      />
    )
  } else if (!contracts) {
    main = <PageLoader message="Đang kết nối contract…" />
  } else {
    return (
      <ContractsProvider value={contracts}>
        <PlatformChromeWithContracts />
      </ContractsProvider>
    )
  }

  return <AppShell {...shellProps} main={main} />
}