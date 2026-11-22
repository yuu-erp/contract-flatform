import { useContracts } from '@meta-platform/chain'
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
import { Outlet, useLocation } from 'react-router-dom'
import { AgentGate } from './AgentGate'
import { useAgentHeader } from './use-agent-header'
import { agentChainId } from '../config/deployments'
import { readDomainParam } from '../lib/read-domain'
import { PreviewRoleMenu } from '../preview/PreviewRoleMenu'
import { resolvePreviewAccess } from '../preview/preview-access'
import { usePreviewAgentWallet } from '../preview/PreviewBootstrap'

function menuForManager(): { to: string; label: string; end?: boolean; icon: LucideIcon }[] {
  return [
    { to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard },
    { to: '/staff', label: 'Nhân sự', icon: Users },
    { to: '/settings', label: 'Cài đặt', icon: Settings },
    { to: '/wallets', label: 'Ví khách', icon: Wallet },
    { to: '/transactions', label: 'Giao dịch', icon: ClipboardList },
    { to: '/audit', label: 'Nhật ký', icon: ScrollText },
  ]
}

function menuForOwner(): { to: string; label: string; end?: boolean; icon: LucideIcon }[] {
  return [
    { to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard },
    { to: '/branches', label: 'Chi nhánh', icon: Store },
    ...menuForManager().slice(1),
  ]
}

export function PreviewAgentChrome() {
  const contracts = useContracts()
  const { role, previewDomain } = usePreviewAgentWallet()
  const location = useLocation()
  const domain = readDomainParam(location.search || `?${previewDomain ? `domain=${previewDomain}` : ''}`)
  const access = resolvePreviewAccess(role, location.search || (previewDomain ? `?domain=${encodeURIComponent(previewDomain)}` : ''))
  const header = useAgentHeader(access.kind === 'owner' || access.kind === 'manager' ? access : null)
  useWalletTheme()
  const paused = false

  const allowed = access.kind === 'owner' || access.kind === 'manager'
  const menu = access.kind === 'manager' ? menuForManager() : menuForOwner()

  if (!contracts) return <PageLoader message="Đang tải dữ liệu giả…" />

  return (
    <AppShell
      title="Meta Agent"
      subtitle={header.subtitle ?? 'Dashboard chủ / quản lý'}
      menu={allowed ? menu : [{ to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard }]}
      chainLabel={String(agentChainId)}
      sidebarFooter={<SidebarWallet />}
      headerWallet={<WalletSwitcher className="shrink-0 md:hidden" />}
      topbarTitle={header.title}
      headerExtra={<ThemeToggle />}
      paused={paused}
      main={
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <PreviewRoleMenu />
          {allowed ? <Outlet context={{ access, domain }} /> : <AgentGate access={access} />}
        </div>
      }
    />
  )
}