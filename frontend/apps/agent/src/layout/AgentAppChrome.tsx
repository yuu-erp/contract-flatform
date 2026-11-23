import { readDomainParam, useAgentAccess, useContracts, withDomain } from '@meta-platform/chain'
import {
  AppShell,
  PageLoader,
  SidebarWallet,
  ThemeToggle,
  WalletSwitcher,
  useWalletTheme,
} from '@meta-platform/ui'
import {
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Settings,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AgentGate } from './AgentGate'
import { useAgentHeader } from './use-agent-header'
import { agentChainId } from '../config/deployments'
import { isPreviewMock } from '../preview/env'
import { PreviewRoleMenu } from '../preview/PreviewRoleMenu'

type MenuItem = { to: string; label: string; end?: boolean; icon: LucideIcon }

function menuForManager(domain?: string): MenuItem[] {
  return [
    { to: withDomain('/', domain), label: 'Tổng quan', end: true, icon: LayoutDashboard },
    { to: withDomain('/staff', domain), label: 'Nhân sự', icon: Users },
    { to: withDomain('/settings', domain), label: 'Cài đặt', icon: Settings },
    { to: withDomain('/wallets', domain), label: 'Ví khách', icon: Wallet },
    { to: withDomain('/transactions', domain), label: 'Giao dịch', icon: ClipboardList },
    { to: withDomain('/audit', domain), label: 'Nhật ký', icon: ScrollText },
  ]
}

function menuForOwner(domain?: string): MenuItem[] {
  return [
    { to: withDomain('/', domain), label: 'Tổng quan', end: true, icon: LayoutDashboard },
    { to: withDomain('/branches', domain), label: 'Chi nhánh', icon: Store },
    ...menuForManager(domain).slice(1),
  ]
}

export function AgentAppChrome() {
  const contracts = useContracts()
  const { data: access, isLoading, isFetching } = useAgentAccess()
  const location = useLocation()
  const navigate = useNavigate()
  const domain = readDomainParam(location.search || (typeof window !== 'undefined' ? window.location.search : ''))
  const header = useAgentHeader(
    access?.kind === 'owner' || access?.kind === 'manager' ? access : null,
  )
  useWalletTheme()

  useEffect(() => {
    if (access?.kind === 'manager' && location.pathname.startsWith('/branches')) {
      navigate(withDomain('/', domain), { replace: true })
    }
  }, [access?.kind, domain, location.pathname, navigate])

  if (!contracts) return <PageLoader message="Đang tải hợp đồng…" />
  if (isLoading || isFetching) return <PageLoader message="Đang xác định vai trò…" />
  if (!access) return <PageLoader message="Đang tải…" />

  const allowed = access.kind === 'owner' || access.kind === 'manager'
  const menu = access.kind === 'manager' ? menuForManager(domain) : menuForOwner(domain)
  const paused = false

  return (
    <AppShell
      title="Meta Agent"
      subtitle={header.subtitle ?? 'Dashboard chủ / quản lý'}
      menu={allowed ? menu : [{ to: withDomain('/', domain), label: 'Tổng quan', end: true, icon: LayoutDashboard }]}
      chainLabel={String(agentChainId)}
      sidebarFooter={<SidebarWallet />}
      headerWallet={<WalletSwitcher className="shrink-0 md:hidden" />}
      topbarTitle={header.title}
      headerExtra={<ThemeToggle />}
      paused={paused}
      main={
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          {isPreviewMock() ? <PreviewRoleMenu /> : null}
          {access.kind === 'manager' && location.pathname.startsWith('/branches') ? (
            <Navigate to={withDomain('/', domain)} replace />
          ) : allowed ? (
            <Outlet context={{ access, domain }} />
          ) : (
            <AgentGate access={access} />
          )}
        </div>
      }
    />
  )
}